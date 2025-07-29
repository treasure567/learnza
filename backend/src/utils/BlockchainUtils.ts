import { MicroserviceUtils, MicroService } from './MicroserviceUtils';
import { CustomError } from '@middleware/errorHandler';

interface LessonCompletion {
    lessonTitle: string;
    lessonDescription: string;
    completedAt: number;
    completed: boolean;
}

interface BlockchainResponse<T> {
    code: number;
    status: boolean;
    message: string;
    data: T;
}

interface LessonCompletionResponse {
    userAddress: string;
    lessonTitle: string;
    lessonDescription: string;
    hash: string;
}

interface CompletedLessonsResponse {
    address: string;
    completedLessons: LessonCompletion[];
}

interface BalanceResponse {
    address: string;
    balance: string;
}

interface DeductPointsResponse {
    userAddress: string;
    amountDeducted: number;
}

export class BlockchainUtils {
    private static readonly BLOCKCHAIN_SERVICE = MicroService.BLOCKCHAIN;

    static async addLessonCompletion(
        userAddress: string,
        lessonTitle: string,
        lessonDescription: string
    ): Promise<LessonCompletionResponse> {
        try {
            const response = await MicroserviceUtils.post<BlockchainResponse<LessonCompletionResponse>>(
                this.BLOCKCHAIN_SERVICE,
                '/lessons/complete',
                {
                    userAddress,
                    lessonTitle,
                    lessonDescription
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error adding lesson completion:', error);
            throw new CustomError('Failed to add lesson completion', 500);
        }
    }

    static async getUserCompletedLessons(
        userAddress: string
    ): Promise<LessonCompletion[]> {
        try {
            const response = await MicroserviceUtils.get<BlockchainResponse<CompletedLessonsResponse>>(
                this.BLOCKCHAIN_SERVICE,
                `/lessons/${userAddress}`
            );
            return response.data.data.completedLessons;
        } catch (error) {
            console.error('Error getting user completed lessons:', error);
            throw new CustomError('Failed to get user completed lessons', 500);
        }
    }

    static async getUserBalance(userAddress: string): Promise<string> {
        try {
            const response = await MicroserviceUtils.get<BlockchainResponse<BalanceResponse>>(
                this.BLOCKCHAIN_SERVICE,
                `/balance/${userAddress}`
            );
            return response.data.data.balance;
        } catch (error) {
            console.error('Error getting user balance:', error);
            throw new CustomError('Failed to get user balance', 500);
        }
    }

    static async deductTokens(
        userAddress: string,
        amount: number
    ): Promise<DeductPointsResponse> {
        try {
            const response = await MicroserviceUtils.post<BlockchainResponse<DeductPointsResponse>>(
                this.BLOCKCHAIN_SERVICE,
                '/deduct-token',
                {
                    userAddress,
                    amount
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error deducting tokens:', error);
            throw new CustomError('Failed to deduct tokens', 500);
        }
    }
}