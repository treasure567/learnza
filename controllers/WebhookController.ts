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
  const timestamp = new Date().toISOString();
  
  try {
    // Log all incoming webhook requests
    console.log(`\n=== WEBHOOK RECEIVED [${timestamp}] ===`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('IP:', req.ip || req.connection.remoteAddress);
    
    const body = req.body as SmsGatewayWebhookPayload;
    
    if (!body || body.event !== 'sms:received' || !body.payload) {
      console.log('❌ Invalid webhook payload - missing body, wrong event, or no payload');
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    const inboundText = body.payload.message?.trim() || '';
    const senderPhone = body.payload.phoneNumber;
    const simNumber = body.payload.simNumber;
    
    console.log(`📱 SMS from ${senderPhone} (SIM ${simNumber}): "${inboundText}"`);
    
    if (!senderPhone || !inboundText) {
      console.log('❌ Missing phone number or message content');
      return res.status(400).json({ success: false, message: 'Missing phoneNumber or message' });
    }

    // Only process messages from SIM 1
    if (simNumber !== 1) {
      console.log(`⚠️ Ignoring SMS from SIM ${simNumber} - only processing SIM 1`);
      return res.status(200).json({ 
        success: true, 
        message: 'SMS ignored - not from SIM 1',
        data: { simNumber, ignored: true }
      });
    }

    console.log('🤖 Generating Gemini reply...');
    const replyText = await geminiService.craftSmsReply(inboundText, senderPhone);
    console.log(`💬 Gemini reply: "${replyText}"`);

    const port = process.env.NOTIFICATION_SERVICE_PORT || 4002;
    const baseUrl = `http://127.0.0.1:${port}`;
    const token = process.env.MICROSERVICE_SECRET;

    console.log(`📤 Posting to internal SMS API: ${baseUrl}/api/notifications/sms`);
    console.log(`🔑 Using auth token: ${token ? 'YES' : 'NO'}`);

    const smsRes = await fetch(`${baseUrl}/api/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ phoneNumber: senderPhone, message: replyText }),
    });

    console.log(`📡 SMS API response status: ${smsRes.status} ${smsRes.statusText}`);

    if (!smsRes.ok) {
      const bodyText = await smsRes.text();
      console.log(`❌ SMS API failed: ${bodyText}`);
      return res.status(502).json({ success: false, message: `Failed to dispatch SMS: ${smsRes.status} ${bodyText}` });
    }

    const smsApiResponse = await smsRes.json();
    console.log('✅ SMS sent successfully:', JSON.stringify(smsApiResponse, null, 2));

    const response = {
      success: true,
      message: 'Auto-reply sent',
      data: {
        to: senderPhone,
        preview: replyText,
        receivedAt: body.payload.receivedAt,
        messageId: body.payload.messageId,
      },
    };

    console.log(`✅ Webhook processed successfully [${timestamp}]`);
    console.log('=== END WEBHOOK ===\n');

    return res.status(200).json(response);
  } catch (error) {
    console.error(`❌ Webhook handling error [${timestamp}]:`, error);
    console.log('=== END WEBHOOK (ERROR) ===\n');
    return res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};

