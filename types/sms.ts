
export interface SmsNotificationRequest {
    phoneNumber?: string;           // Single phone number (for backward compatibility)
    phoneNumbers?: string[];        // Multiple phone numbers (new feature)
    message: string;
}

export interface SmsNotificationResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface SmsHealthCheckResponse {
    success: boolean;
    message: string;
    configured?: boolean;
}

// New interface for bulk SMS
export interface BulkSmsRequest {
    phoneNumbers: string[];
    message: string;
}

export interface BulkSmsResponse {
    success: boolean;
    message: string;
    results: {
        phoneNumber: string;
        success: boolean;
        error?: string;
    }[];
} 