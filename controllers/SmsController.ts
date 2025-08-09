import { Request, Response } from 'express';
import SmsService from '../services/SmsService';

export const sendSmsNotification = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, phoneNumbers, message } = req.body as {
      phoneNumber?: string;
      phoneNumbers?: string[];
      message?: string;
    };

    if (!phoneNumber && (!phoneNumbers || phoneNumbers.length === 0)) {
      return res.status(400).json({ success: false, message: 'phoneNumber or phoneNumbers is required' });
    }
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    if (phoneNumber) {
      if (!phoneNumber.startsWith('+')) {
        return res.status(400).json({ success: false, message: 'Phone number must include country code (e.g., +1234567890)' });
      }
      const data = await SmsService.sendSms(phoneNumber, message);
      return res.status(200).json({ success: true, message: 'SMS sent successfully', data });
    }

    const invalidNumbers = (phoneNumbers || []).filter((n) => !n.startsWith('+'));
    if (invalidNumbers.length > 0) {
      return res.status(400).json({ success: false, message: 'All phone numbers must include country code', invalidNumbers });
    }

    const results = await SmsService.sendSmsToMultiple(phoneNumbers as string[], message);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    return res.status(200).json({
      success: true,
      message: `SMS sent to ${successCount} recipients${failureCount ? `, ${failureCount} failed` : ''}`,
      results,
      summary: { total: results.length, successful: successCount, failed: failureCount },
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  }
};

export const sendBulkSms = async (req: Request, res: Response) => {
  try {
    const { phoneNumbers, message } = req.body as { phoneNumbers?: string[]; message?: string };
    if (!phoneNumbers?.length) return res.status(400).json({ success: false, message: 'phoneNumbers is required' });
    if (!message) return res.status(400).json({ success: false, message: 'message is required' });

    const invalidNumbers = phoneNumbers.filter((n) => !n.startsWith('+'));
    if (invalidNumbers.length > 0) {
      return res.status(400).json({ success: false, message: 'All phone numbers must include country code', invalidNumbers });
    }

    const data = await SmsService.sendBulkSms(phoneNumbers, message);
    return res.status(200).json({ success: true, message: `Bulk SMS sent successfully to ${phoneNumbers.length} recipients`, data });
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  }
};

export const smsHealthCheck = async (req: Request, res: Response) => {
  try {
    if (!process.env.SMS_GATE_USERNAME || !process.env.SMS_GATE_PASSWORD) {
      return res.status(503).json({ success: false, message: 'SMS service not configured - missing credentials' });
    }
    return res.status(200).json({ success: true, message: 'SMS service is healthy and ready', configured: true });
  } catch {
    return res.status(500).json({ success: false, message: 'SMS service health check failed' });
  }
};

