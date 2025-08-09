export interface SmsNotificationRequest {
  phoneNumber?: string;
  phoneNumbers?: string[];
  message: string;
}

export interface BulkSmsRequest {
  phoneNumbers: string[];
  message: string;
}

export interface SmsHealthCheckResponse {
  success: boolean;
  message: string;
  configured?: boolean;
}

