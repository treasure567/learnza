import { Request, Response } from 'express';
import SmsService from '../services/SmsService';
import { SmsNotificationRequest, BulkSmsRequest } from '../types/sms';

export const sendSmsNotification = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, phoneNumbers, message } = req.body as SmsNotificationRequest;

        // Validate that we have either phoneNumber or phoneNumbers
        if (!phoneNumber && (!phoneNumbers || phoneNumbers.length === 0)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: phoneNumber or phoneNumbers array is required' 
            });
        }

        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required field: message is required' 
            });
        }

        // Handle single phone number (backward compatibility)
        if (phoneNumber) {
            // Validate phone number format
            if (!phoneNumber.startsWith('+')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Phone number must include country code (e.g., +1234567890)' 
                });
            }

            const response = await SmsService.sendSms(phoneNumber, message);
            return res.status(200).json({ 
                success: true, 
                message: 'SMS sent successfully', 
                data: response 
            });
        }

        // Handle multiple phone numbers
        if (phoneNumbers && phoneNumbers.length > 0) {
            // Validate all phone numbers
            const invalidNumbers = phoneNumbers.filter(num => !num.startsWith('+'));
            if (invalidNumbers.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All phone numbers must include country code (e.g., +1234567890)',
                    invalidNumbers
                });
            }

            // Send to multiple numbers
            const results = await SmsService.sendSmsToMultiple(phoneNumbers, message);
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            return res.status(200).json({ 
                success: true, 
                message: `SMS sent to ${successCount} recipients${failureCount > 0 ? `, ${failureCount} failed` : ''}`, 
                results,
                summary: {
                    total: phoneNumbers.length,
                    successful: successCount,
                    failed: failureCount
                }
            });
        }

    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
};

// New endpoint specifically for bulk SMS
export const sendBulkSms = async (req: Request, res: Response) => {
    try {
        const { phoneNumbers, message } = req.body as BulkSmsRequest;

        if (!phoneNumbers || phoneNumbers.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'phoneNumbers array is required and cannot be empty' 
            });
        }

        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: 'message is required' 
            });
        }

        // Validate all phone numbers
        const invalidNumbers = phoneNumbers.filter(num => !num.startsWith('+'));
        if (invalidNumbers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'All phone numbers must include country code (e.g., +1234567890)',
                invalidNumbers
            });
        }

        // Use bulk SMS method (single API call)
        const response = await SmsService.sendBulkSms(phoneNumbers, message);

        return res.status(200).json({ 
            success: true, 
            message: `Bulk SMS sent successfully to ${phoneNumbers.length} recipients`, 
            data: response,
            summary: {
                total: phoneNumbers.length,
                phoneNumbers
            }
        });

    } catch (error) {
        console.error('Error sending bulk SMS:', error);
        return res.status(500).json({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
};

// Health check endpoint for SMS service
export const smsHealthCheck = async (req: Request, res: Response) => {
    try {
        // Check if SMS credentials are configured
        if (!process.env.SMS_GATE_USERNAME || !process.env.SMS_GATE_PASSWORD) {
            return res.status(503).json({ 
                success: false, 
                message: 'SMS service not configured - missing credentials' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'SMS service is healthy and ready',
            configured: true
        });
    } catch (error) {
        console.error('SMS health check error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'SMS service health check failed' 
        });
    }
}; 