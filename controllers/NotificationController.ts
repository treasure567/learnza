
import { Request, Response } from 'express';
import { FirebaseService } from '../services/FirebaseService';
import { EmailService } from '../services/EmailService';
import { PushNotificationRequest, EmailNotificationRequest } from '../types/notification';

export const sendPushNotification = async (req: Request, res: Response) => {
    try {
        const { token, title, body } = req.body as PushNotificationRequest;

        if (!token || !title || !body) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const response = await FirebaseService.sendPushNotification(token, title, body);

        return res.status(200).json({ success: true, message: 'Push notification sent successfully', data: response });
    } catch (error) {
        console.error('Error sending push notification:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const sendEmailNotification = async (req: Request, res: Response) => {
    try {
        const { to, subject, html } = req.body as EmailNotificationRequest;

        if (!to || !subject || !html) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const response = await EmailService.sendEmail(to, subject, html);

        return res.status(200).json({ success: true, message: 'Email sent successfully', data: response });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}; 