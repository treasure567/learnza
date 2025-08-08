import { Request, Response } from 'express';
import Spitch from 'spitch';
import dotenv from 'dotenv';

dotenv.config();

type SupportedLanguage = 'en' | 'yo' | 'ha' | 'ig';

export class SpeechController {
  private client: Spitch;

  constructor() {
    const apiKey = process.env.SPITCH_API_KEY;
    if (!apiKey) {
      throw new Error('SPITCH_API_KEY is not configured');
    }
    this.client = new Spitch({ apiKey });
  }

  public generate = async (req: Request, res: Response) => {
    try {
      const { text, language, voice, filename, return: returnMode } = req.body as {
        text: string;
        language: SupportedLanguage;
        voice?: string;
        filename?: string;
        return?: 'base64' | 'stream';
      };
      const responseMode: 'base64' | 'stream' = (returnMode || 'base64');

      if (!text || !language) {
        return res.status(400).json({ success: false, message: 'Missing required fields: text, language' });
      }

      const voiceMap: Record<SupportedLanguage, string> = {
        en: 'john',
        yo: 'segun',
        ha: 'hasan',
        ig: 'ngozi',
      };

      const selectedVoice = voice || voiceMap[language];

      const spitchRes = await this.client.speech.generate({
        text,
        language,
        voice: selectedVoice as any,
      });

      const blob = await spitchRes.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = blob.type || 'audio/wav';
      const suggestedName = filename || `speech_${language}.wav`;

      if (responseMode === 'stream') {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${suggestedName}"`);
        return res.status(200).send(buffer);
      }

      const base64 = buffer.toString('base64');
      return res.status(200).json({
        success: true,
        message: 'Speech generated successfully',
        data: {
          filename: suggestedName,
          contentType,
          audioBase64: base64,
        },
      });
    } catch (error: any) {
      console.error('Error generating speech:', error?.message || error);
      return res.status(500).json({ success: false, message: 'Failed to generate speech' });
    }
  };
}

