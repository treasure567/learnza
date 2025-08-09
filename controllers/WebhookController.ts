import { Request, Response } from 'express';
import geminiService from '../services/GeminiService';
import fetch from 'node-fetch';

interface SmsGatewayWebhookPayload {
  deviceId: string;
  event: string; // e.g., 'sms:received'
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

    // Generate a sleek, informative reply using Gemini 2.5 Flash
    const replyText = await geminiService.craftSmsReply(inboundText, senderPhone);

    // Post to internal API /api/sms so we go through the same controller flow
    const port = process.env.SMS_SERVICE_PORT || 4002;
    const baseUrl = `http://127.0.0.1:${port}`;
    const token = process.env.SMS_SECRET;

    try {
      const smsRes = await fetch(`${baseUrl}/api/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phoneNumber: senderPhone, message: replyText }),
      });

      if (!smsRes.ok) {
        const body = await smsRes.text();
        throw new Error(`Internal /api/sms failed: ${smsRes.status} ${smsRes.statusText} - ${body}`);
      }
    } catch (e) {
      // As a resilience fallback, try sending directly through SmsService if token is missing
      // or internal call failed. We avoid importing the service to keep this controller decoupled.
      console.error('Falling back after /api/sms error:', e);
      // No direct send here to keep single pathway as requested; just report failure.
      return res.status(502).json({ success: false, message: 'Failed to dispatch SMS via internal API' });
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

