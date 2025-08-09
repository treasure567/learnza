
export interface InteractionRequest {
    userId: string;
    userChat: string;
    contentId: string;
    languageCode?: 'en' | 'yo' | 'ha' | 'ig' | string;
}

export interface InteractionResponse {
    success: boolean;
    message: string;
    data?: any;
} 