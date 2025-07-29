import express, { Request, Response, NextFunction } from 'express';
import { ethers } from "ethers";
import { Learnza__factory } from './typechain-types';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'default-api-key-change-this';
const LEARNZA_ADDRESS: string = process.env.LEARNZA_ADDRESS || "";

app.use(express.json());
app.use(cors());

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

const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

app.post('/lessons/complete', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userAddress, lessonTitle, lessonDescription } = req.body;

        if (!userAddress || !lessonTitle || !lessonDescription) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Missing required fields'
            });
        }

        if (!isValidEthereumAddress(userAddress)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = Learnza__factory.connect(LEARNZA_ADDRESS, signer);

        const tx = await contract.addLessonCompletion(userAddress, lessonTitle, lessonDescription);
        await tx.wait();

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Lesson completion recorded successfully',
            data: {
                userAddress,
                lessonTitle,
                lessonDescription,
                hash: tx.hash
            }
        });
    } catch (error: any) {
        console.error('Error recording lesson completion:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to record lesson completion',
            data: { error: error.message }
        });
    }
});

app.get('/lessons/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = Learnza__factory.connect(LEARNZA_ADDRESS, signer);

        const completedLessons = await contract.getUserCompletedLessons(address);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'User completed lessons retrieved successfully',
            data: {
                address,
                completedLessons
            }
        });
    } catch (error: any) {
        console.error('Error getting user completed lessons:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user completed lessons',
            data: { error: error.message }
        });
    }
});

app.get('/balance/:address', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { address } = req.params;

        if (!isValidEthereumAddress(address)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = Learnza__factory.connect(LEARNZA_ADDRESS, signer);

        const balance = await contract.checkBalance(address);

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'User balance retrieved successfully',
            data: {
                address,
                balance: ethers.formatEther(balance)
            }
        });
    } catch (error: any) {
        console.error('Error getting user balance:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to get user balance',
            data: { error: error.message }
        });
    }
});

app.post('/deduct-token', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userAddress, amount } = req.body;

        if (!userAddress || !amount) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Missing required fields'
            });
        }

        if (!isValidEthereumAddress(userAddress)) {
            return sendResponse(res, {
                code: 400,
                status: false,
                message: 'Invalid Ethereum address'
            });
        }

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const contract = Learnza__factory.connect(LEARNZA_ADDRESS, signer);

        const tx = await contract.deductFromUserBalance(userAddress, ethers.parseEther(amount.toString()));
        await tx.wait();

        return sendResponse(res, {
            code: 200,
            status: true,
            message: 'Tokens deducted successfully',
            data: {
                userAddress,
                amountDeducted: amount
            }
        });
    } catch (error: any) {
        console.error('Error deducting tokens:', error.message);
        return sendResponse(res, {
            code: 500,
            status: false,
            message: 'Failed to deduct tokens',
            data: { error: error.message }
        });
    }
});

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
