import { Request, Response } from 'express';
import geminiService from '../services/GeminiService';
import fetch from 'node-fetch';

interface SmsGatewayWebhookPayload {
  deviceId: string;
  event: string; // 'sms:received'
  id: string;
  payload: {
    message: string;
    receivedAt: string;
    messageId: string;
    phoneNumber: string;
    simNumber?: number;
  };
  webhookId?: string;
}

export const handleSmsWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body as SmsGatewayWebhookPayload;
    if (!body || body.event !== 'sms:received' || !body.payload) {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    const inboundText = body.payload.message?.trim() || '';
    const senderPhone = body.payload.phoneNumber;
    if (!senderPhone || !inboundText) {
      return res.status(400).json({ success: false, message: 'Missing phoneNumber or message' });
    }

    const replyText = await geminiService.craftSmsReply(inboundText, senderPhone);

    const port = process.env.NOTIFICATION_SERVICE_PORT || 4002;
    const baseUrl = `http://127.0.0.1:${port}`;
    const token = process.env.MICROSERVICE_SECRET;

    const smsRes = await fetch(`${baseUrl}/api/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ phoneNumber: senderPhone, message: replyText }),
    });

    if (!smsRes.ok) {
      const bodyText = await smsRes.text();
      return res.status(502).json({ success: false, message: `Failed to dispatch SMS: ${smsRes.status} ${bodyText}` });
    }

    return res.status(200).json({
      success: true,
      message: 'Auto-reply sent',
      data: {
        to: senderPhone,
        preview: replyText,
        receivedAt: body.payload.receivedAt,
        messageId: body.payload.messageId,
      },
    });
  } catch (error) {
    console.error('Webhook handling error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};

