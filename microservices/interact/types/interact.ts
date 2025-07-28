
export interface InteractionRequest {
    userId: string;
    userChat: string;
    contentId: string;
}

export interface InteractionResponse {
    success: boolean;
    message: string;
    data?: any;
} 