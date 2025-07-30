import express, { Request, Response, NextFunction } from 'express';
import { ethers } from "ethers";
import { SomniaPumpaz__factory } from './typechain-types';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import { User, initDatabase } from './models';
import discordAuthRoutes from './discord-auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'default-api-key-change-this';
const SOMNIA_PUMPAZ_ADDRESS: string = process.env.PUMPAZ_ADDRESS || "";
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || "";
const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

const bots = [
    "MTM5NDk4NDcwNjY3NTU3Mjc5Nw.GEm-d_.A4S1uH6SbH0L4LN7xsj8HaZu950S9UrtZ4cwpI",
    "MTM5NTUxMzMwNDcwNDYxODY4Ng.GKxiqW.X0JCzuImmyDmcUWfb6nE-ThadV2HCg82jIqcN4",
    "MTM5NTUxNDI4ODA3NTk2ODczMw.G8r3vZ.foWFGCpzhQBiqwwKt-1Sm3Msrnms7gIHAoi5yc",
    "MTM5NTUxODU4OTc2MjUzNTU2Ng.Gza7oF.oKsQLAeejQurK94z2upjABvK0lcUFP5-Vhf9_c",
    "MTM5NTUxOTA3NzU3MjgwODc4NA.GisPIt.6yzVaWwXmjqkDmG1tA-2pcipH20rMB5gjazluA",
    "MTM5NTUxOTUzNTgxMzA5OTYwMA.GiGZd8.Ne-W-2-vWlNwuPYO9ElxitMJvPRWIpcUfP0sqc",
    "MTM5NTUyNDYzNTAwNDUwNjIyMw.GAl6GD.ZINMMURFU3pBEd17LRTo8Olid9YE6NqdV5itas",
    "MTM5NTUyNTAwOTc2MTM3MDEzMw.GXzHGV.QWKjwzWUq_GHv3XfBne89sQCVRNDQb3mySIghA",
    "MTM5NTUyNTUwNTAxMjQ2NTY5NQ.G7JfBH.t44LN589oc98m-Ku4-56gb32xRo6iI2cIB2tDs",
    "MTM5NTUyNTkwODkyODAwNDE1OA.GxsujX.Fc7KaDnDWk33BKHzBNcXTvFsfwSYLYW-f15vbo",
    "MTM5NTUyODM4MjA5NTAzNjUyNg.GRzftg.syTHnLNI1JRZ-7BdeampDG5cYC-yE77ra4Ev84",
    "MTM5NTUyODk0NTAyNTE1NTA5Mw.Gl2aoe.tSGHyaxh__BCIxBQneVpNRd49fdqmJuvv5iZMw"
];

const activeClaimProcesses: Set<string> = new Set();

type Task<T> = {
    execute: () => Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};

class TokenQueue {
    private queue: Task<any>[] = [];
    private lockUntil: number = 0;
    private processing: boolean = false;
    private interval: NodeJS.Timeout | null = null;
    private readonly processDelay: number;
    public readonly token: string;

    constructor(token: string, processDelay: number = 800) {
        this.token = token;
        this.processDelay = processDelay;
        this.startProcessing();
    }

    public enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                execute: task,
                resolve,
                reject
            });
        });
    }

    public isLocked(): boolean {
        return Date.now() < this.lockUntil;
    }

    public getLockRemainingTime(): number {
        return Math.max(0, this.lockUntil - Date.now());
    }

    public lock(durationMs: number): void {
        this.lockUntil = Date.now() + durationMs;
    }

    private startProcessing(): void {
        this.interval = setInterval(() => this.processNext(), this.processDelay);
    }

    private async processNext(): Promise<void> {
        if (this.processing || this.isLocked() || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        const task = this.queue.shift();

        if (task) {
            try {
                const result = await task.execute();
                task.resolve(result);
            } catch (error: any) {
                if (error.response && error.response.status === 429 && error.response.data.retry_after) {
                    const retryAfterMs = Math.round(error.response.data.retry_after * 1000);
                    console.log(`Rate limited. Retry after: ${error.response.data.retry_after}s`);
                    this.lock(retryAfterMs);

                    this.queue.unshift(task);
                } else {
                    task.reject(error);
                }
            } finally {
                this.processing = false;
            }
        }
    }

    public stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

const tokenQueues: TokenQueue[] = bots.map(token => new TokenQueue(token));

function getAvailableQueue(): TokenQueue | null {
    const unlocked = tokenQueues.filter(queue => !queue.isLocked());
    if (unlocked.length === 0) {
        return null;
    }

    return unlocked.reduce((shortest, current) =>
        shortest.getLockRemainingTime() < current.getLockRemainingTime() ? shortest : current
        , unlocked[0]);
}

async function fetchDiscordMembers(token: string, after?: string): Promise<any[]> {
    const response = await axios.get(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members`, {
        headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        params: {
            limit: 1000,
            ...(after ? { after } : {})
        }
    });

    return response.data;
}

initDatabase();

// Middleware
app.use(express.json());
app.use(cors());

// Add Discord OAuth2 routes
app.use('/api', discordAuthRoutes);

// Standard API response function
interface StandardResponse {
    code: number;
    status: boolean;
    message: string;
    data?: any;
}

const sendResponse = (res: Response, { code, status, message, data }: StandardResponse): Response => {
    return res.status(code).json({
        code,
        status,
        message,
        data
    });
};

// Auth middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendResponse(res, {
            code: 401,
            status: false,
            message: 'Missing authentication token'
        });
    }

    if (token !== API_KEY) {
        return sendResponse(res, {
            code: 403,
            status: false,
            message: 'Invalid authentication token'
        });
    }

    next();
};

// Helper function to validate Ethereum address
const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

app.post('/api/users/can-claim', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.body;
        if (!address) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Missing address'
            });
        }
        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }
        let user = await User.findOne({ where: { address } });
        if (!user) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Connect your discord account to claim',
                data: {
                    connected: false,
                    hasClaimed: false
                }
            });
        }
        if (user.discord_claimed && user.x_claimed) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'User already claimed',
                data: {
                    connected: false,
                    discordUsername: user.discordUsername,
                    hasClaimed: true
                }
            });
        }
        if (!user.access_token) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Connect your discord account to claim',
                data: {
                    discordUsername: user.discordUsername,
                    connected: false,
                    hasClaimed: false
                }
            });
        }
        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'User can claim',
            data: {
                address: user.address,
                discordUsername: user.discordUsername,
                x_claimed: user.x_claimed,
                discord_claimed: user.discord_claimed,
                discord_claimedAt: user.discord_claimedAt,
                x_claimedAt: user.x_claimedAt,
                hasClaimed: false
            }
        });

    } catch (error: any) {
        console.error('Error checking if user can claim:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to check if user can claim'
        });
    }
});

app.post('/api/auth/discord/disconnect', authenticateToken, async (req: Request, res: Response) => {
    const { address } = req.body;
    if (!address) {
        return sendResponse(res, {
            code: 200,
            status: false,
            message: 'Missing wallet address'
        });
    }
    if (!isValidEthereumAddress(address)) {
        return sendResponse(res, {
            code: 200,
            status: false,
            message: 'Invalid Ethereum address'
        });
    }
    let userData = await User.findOne({ where: { address } });
    if (!userData) {
        return sendResponse(res, {
            code: 200,
            status: false,
            message: 'User not found'
        });
    }
    if (activeClaimProcesses.has(address)) {
        return sendResponse(res, {
            code: 200,
            status: false,
            message: 'Another claim is already in queue for this address, please check back in a few minutes'
        });
    }
    if (userData.discord_claimed && userData.x_claimed) {
        return sendResponse(res, {
            code: 200,
            status: false,
            message: 'You cannot disconnect your discord account because you have already claimed'
        });
    }
    userData.discordUsername = "";
    userData.discord_id = "";
    userData.discriminator = "";
    userData.global_name = "";
    userData.access_token = "";
    userData.refresh_token = "";
    await userData.save();
    return sendResponse(res, {
        code: 200,
        status: true,
        message: 'Discord account disconnected successfully'
    });
});

app.post('/api/users/claim', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.body;
        if (!address) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Missing address or type'
            });
        }
        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        if (activeClaimProcesses.has(address)) {
            return sendResponse(res, {
                code: 200,
                status: false,
                message: 'Another claim is already in queue for this address, please check back in a few minutes'
            });
        }

        activeClaimProcesses.add(address);

        try {
            let user = await User.findOne({ where: { address } });
            if (!user) {
                activeClaimProcesses.delete(address);
                return sendResponse(res, {
                    code: 200,
                    status: false,
                    message: 'User not found'
                });
            }
            if (user.discord_claimed && user.x_claimed) {
                activeClaimProcesses.delete(address);
                return sendResponse(res, {
                    code: 200,
                    status: false,
                    message: 'User already claimed'
                });
            }
            if (!user.discordUsername) {
                activeClaimProcesses.delete(address);
                return sendResponse(res, {
                    code: 200,
                    status: false,
                    message: 'User has no discord username'
                });
            }
            const discord = await verifyDiscord(user);
            if (discord.status === false) {
                activeClaimProcesses.delete(address);
                return sendResponse(res, {
                    code: 200,
                    status: false,
                    message: discord.message
                });
            }
            const points = await giveUserPoints(address, 500);
            if (!points) {
                activeClaimProcesses.delete(address);
                return sendResponse(res, {
                    code: 200,
                    status: false,
                    message: 'Failed to give user points'
                });
            }
            user.discord_claimed = true;
            user.x_claimed = true;
            user.discord_claimedAt = new Date();
            user.x_claimedAt = new Date();
            await user.save();
            activeClaimProcesses.delete(address);
            return sendResponse(res, {
                code: 200,
                status: true,
                message: 'User claim status updated successfully',
                data: {
                    id: user.id,
                    address: user.address,
                    discordUsername: user.discordUsername,
                    x_claimed: user.x_claimed,
                    x_claimedAt: user.x_claimedAt,
                    discord_claimed: user.discord_claimed,
                    discord_claimedAt: user.discord_claimedAt
                }
            });
        } catch (error: any) {
            activeClaimProcesses.delete(address);
            throw error;
        }
    } catch (error: any) {
        console.error('Error updating user claim status:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to update user claim status',
            data: { error: error.message }
        });
    }
});

async function verifyDiscord(user: User) {
    if (!DISCORD_SERVER_ID) {
        return {
            code: 200,
            status: false,
            message: 'Discord server ID is missing',
            data: { username: user.discordUsername }
        }
    }

    try {
        if (user.expires_at && new Date() > user.expires_at) {
            try {
                const refreshResponse = await axios.post(`${DISCORD_API_URL}/oauth2/token`,
                    new URLSearchParams({
                        client_id: DISCORD_CLIENT_ID,
                        client_secret: DISCORD_CLIENT_SECRET,
                        grant_type: 'refresh_token',
                        refresh_token: user.refresh_token
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
                const { access_token, refresh_token, expires_in } = refreshResponse.data;
                user.access_token = access_token;
                user.refresh_token = refresh_token;
                user.expires_at = new Date(Date.now() + expires_in * 1000);
                await user.save();
            } catch (refreshError) {
                console.log("Failed to refresh Discord token:", refreshError.message);
                return {
                    code: 403,
                    status: false,
                    message: 'Failed to verify Discord membership (rt)',
                    data: { username: user.discordUsername }
                }
            }
        }
        const guildsResponse = await axios.get(`${DISCORD_API_URL}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${user.access_token}`
            }
        });
        const isInGuild = guildsResponse.data.some((guild: any) => guild.id === DISCORD_SERVER_ID);
        if (!isInGuild) {
            return {
                code: 403,
                status: false,
                message: 'You are not a member of the required Discord server',
                data: { username: user.discordUsername }
            }
        }
        return {
            code: 200,
            status: true,
            message: 'User is a member of the required Discord server',
            data: { username: user.discordUsername }
        }
    } catch (error: any) {
        console.log("Failed to verify Discord membership:", error.message);
        return {
            code: 500,
            status: false,
            message: 'Failed to verify Discord membership (1)',
            data: { error: 'Failed to verify Discord membership (1)' }
        }
    }
}

async function giveUserPoints(address: string, points: number) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);
        const tx = await contract.addPoints(address, points);
        await tx.wait();
        return true;
    } catch (error: any) {
        console.error('Error giving user points:', error.message);
        return false;
    }
}

// Get user dice count endpoint
app.post('/api/verify-dice/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        // Use ethers.js directly instead of from hardhat
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);

        const count = await contract.getUserDiceCount(address);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Dice count retrieved successfully',
            data: {
                address,
                diceCount: Number(count)
            }
        });
    } catch (error: any) {
        console.error('Error getting user dice count:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user dice count',
            data: { error: error.message, diceCount: 0 }
        });
    }
});

// Get user flip count endpoint
app.post('/api/verify-flip/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        // Use ethers.js directly instead of from hardhat
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);

        const count = await contract.getUserFlipCount(address);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Flip count retrieved successfully',
            data: {
                address,
                flipCount: Number(count)
            }
        });
    } catch (error: any) {
        console.error('Error getting user flip count:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user flip count',
            data: { error: error.message, flipCount: 0 }
        });
    }
});

app.post('/api/verify-claim/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        // Use ethers.js directly instead of from hardhat
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);

        const [totalClaimed, _] = await contract.getClaimHistory(address);
        const claimCount = Math.floor(Number(ethers.formatEther(totalClaimed)) / 1000);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Claim count retrieved successfully',
            data: {
                address,
                claimCount
            }
        });
    } catch (error: any) {
        console.error('Error getting user claim count:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user claim count',
            data: { error: error.message, claimCount: 0 }
        });
    }
});

// Get user points endpoint
app.post('/api/verify-points/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        // Use ethers.js directly instead of from hardhat
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);

        const points = await contract.getUserPoints(address);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'User points retrieved successfully',
            data: {
                address,
                points: Number(points)
            }
        });
    } catch (error: any) {
        // console.error('Error getting user points:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user points',
            data: { error: error.message, points: 0 }
        });
    }
});

// Get leaderboard endpoint
app.post('/api/leaderboard', authenticateToken, async (req: Request, res: Response) => {
    try {
        const limit = req.body.limit || 10;

        if (typeof limit !== 'number' || limit <= 0 || limit > 100) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid limit. Must be a number between 1 and 100'
            });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = SomniaPumpaz__factory.connect(SOMNIA_PUMPAZ_ADDRESS, signer);

        const [addresses, points] = await contract.getLeaderboard(limit);

        const leaderboard = addresses.map((address: string, index: number) => ({
            rank: index + 1,
            address,
            points: Number(points[index])
        }));

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Leaderboard retrieved successfully',
            data: {
                leaderboard,
                total: leaderboard.length
            }
        });
    } catch (error: any) {
        console.error('Error getting leaderboard:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get leaderboard',
            data: { error: error.message, leaderboard: [], total: 0 }
        });
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    return sendResponse(res, {
        code: 200,
        status: true,
        message: 'Server is healthy',
        data: {
            timestamp: new Date().toISOString()
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app; 