
export interface PushNotificationRequest {
    token: string;
    title: string;
    body: string;
}

export interface EmailNotificationRequest {
    to: string;
    subject: string;
    html: string;
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data?: any;
} 