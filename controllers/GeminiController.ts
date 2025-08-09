import { Request, Response } from 'express';
import geminiService from '../services/GeminiService';
import SmsService from '../services/SmsService';

export const testGeminiReply = async (req: Request, res: Response) => {
  try {
    const { message, phoneNumber } = req.body as { message?: string; phoneNumber?: string };

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const sender = phoneNumber || '+10000000000';
    const reply = await geminiService.craftSmsReply(message, sender);

    return res.status(200).json({
      success: true,
      message: 'Gemini reply generated',
      data: {
        input: { message, phoneNumber: sender },
        reply,
      },
    });
  } catch (error) {
    console.error('Gemini test endpoint error:', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  }
};

export const sendGeminiReplySms = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message } = req.body as { phoneNumber?: string; message?: string };

    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      return res.status(400).json({ success: false, message: 'phoneNumber (with country code) is required' });
    }
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const reply = await geminiService.craftSmsReply(message, phoneNumber);
    const data = await SmsService.sendSms(phoneNumber, reply, 1);

    return res.status(200).json({
      success: true,
      message: 'Gemini reply generated and sent via SMS',
      data: {
        to: phoneNumber,
        reply,
        gateway: data,
      },
    });
  } catch (error) {
    console.error('Gemini send-test endpoint error:', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  }
};

