import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CustomError } from '@middleware/errorHandler';

export enum MicroService {
    AI = 'AI',
    INTERACT = 'INTERACT',
    BLOCKCHAIN = 'BLOCKCHAIN',
    NOTIFICATION = 'NOTIFICATION'
}

interface ServiceConfig {
    baseURL: string;
    timeout?: number;
}

interface MicroServiceResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export class MicroserviceUtils {
    private static instances: Map<MicroService, AxiosInstance> = new Map();
    private static readonly DEFAULT_TIMEOUT = 30000; 

    private static getServiceSecret(service: MicroService): string|undefined {
        switch (service) {
            case MicroService.AI:
                return process.env.AI_SERVICE_SECRET;
            case MicroService.INTERACT:
                return process.env.INTERACT_SERVICE_SECRET;
            case MicroService.BLOCKCHAIN:
                return process.env.BLOCKCHAIN_SERVICE_SECRET;
            case MicroService.NOTIFICATION:
                return process.env.NOTIFICATION_SERVICE_SECRET;
            default:
                return undefined;
        }
    }

    private static getServiceConfig(service: MicroService): ServiceConfig {
        switch (service) {
            case MicroService.AI:
                if (!process.env.AI_SERVICE_URI) {
                    throw new Error('AI_SERVICE_URI environment variable is not set');
                }
                return {
                    baseURL: process.env.AI_SERVICE_URI,
                    timeout: 100000
                };
            case MicroService.INTERACT:
                if (!process.env.INTERACT_SERVICE_URI) {
                    throw new Error('INTERACT_SERVICE_URI environment variable is not set');
                }
                return {
                    baseURL: process.env.INTERACT_SERVICE_URI,
                    timeout: 100000
                };
            case MicroService.BLOCKCHAIN:
                if (!process.env.BLOCKCHAIN_SERVICE_URI) {
                    throw new Error('BLOCKCHAIN_SERVICE_URI environment variable is not set');
                }
                return {
                    baseURL: process.env.BLOCKCHAIN_SERVICE_URI,
                    timeout: 30000
                };
            case MicroService.NOTIFICATION:
                if (!process.env.NOTIFICATION_SERVICE_URI) {
                    throw new Error('NOTIFICATION_SERVICE_URI environment variable is not set');
                }
                return {
                    baseURL: process.env.NOTIFICATION_SERVICE_URI,
                    timeout: 30000
                };
            default:
                throw new Error(`Unknown microservice: ${service}`);
        }
    }

    private static getInstance(service: MicroService): AxiosInstance {
        if (!this.instances.has(service)) {
            const config = this.getServiceConfig(service);
            const instance = axios.create({
                baseURL: config.baseURL,
                timeout: config.timeout || this.DEFAULT_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            instance.interceptors.request.use((config) => {
                const serviceSecret = this.getServiceSecret(service);
                if (!serviceSecret) {
                    throw new Error(`MICROSERVICE_SECRET for ${service} is not set`);
                }
                config.headers.Authorization = `Bearer ${serviceSecret}`;
                return config;
            });

            instance.interceptors.response.use(
                (response) => {
                    // For streaming responses, return the full response so callers can access headers and pipe the stream
                    if (response.config.responseType === 'stream') {
                        return response;
                    }
                    return response.data;
                },
                (error) => {
                    if (error.response) {
                        throw new CustomError(
                            error.response.data.message || 'Microservice error',
                            error.response.status
                        );
                    }
                    if (error.code === 'ECONNABORTED') {
                        throw new CustomError('Microservice timeout', 504);
                    }
                    throw new CustomError('Microservice unavailable', 503);
                }
            );

            this.instances.set(service, instance);
        }

        return this.instances.get(service)!;
    }

    static async get<T>(
        service: MicroService,
        endpoint: string,
        params?: Record<string, any>,
        config?: Partial<AxiosRequestConfig>
    ): Promise<MicroServiceResponse<T>> {
        try {
            const instance = this.getInstance(service);
            return await instance.get(endpoint, { params, ...config });
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    static async post<T>(
        service: MicroService,
        endpoint: string,
        data?: any,
        config?: Partial<AxiosRequestConfig>
    ): Promise<MicroServiceResponse<T>> {
        try {
            const instance = this.getInstance(service);
            return await instance.post(endpoint, data, config);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private static handleError(error: any): never {
        if (error instanceof CustomError) {
            console.error('Microservice Error:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }

        console.error('Microservice Error:', {
            message: error.message,
            stack: error.stack,
            service: error.config?.baseURL,
            endpoint: error.config?.url
        });

        throw new CustomError(
            'An unexpected error occurred while communicating with the microservice',
            500
        );
    }
} 