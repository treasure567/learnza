import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

class SmsService {
  private username = process.env.SMS_GATE_USERNAME;
  private password = process.env.SMS_GATE_PASSWORD;
  private api_url = 'https://sms.trenalyze.com/api/3rdparty/v1/messages';

  constructor() {
    if (!this.username || !this.password) {
      throw new Error('SMS_GATE_USERNAME and SMS_GATE_PASSWORD must be set in environment variables');
    }
  }

  async sendSms(phoneNumber: string, message: string) {
    const response = await fetch(this.api_url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textMessage: { text: message },
        phoneNumbers: [phoneNumber],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send SMS: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  async sendBulkSms(phoneNumbers: string[], message: string) {
    const response = await fetch(this.api_url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textMessage: { text: message },
        phoneNumbers: phoneNumbers,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send bulk SMS: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  async sendSmsToMultiple(phoneNumbers: string[], message: string) {
    const results: Array<{ phoneNumber: string; success: boolean; data?: any; error?: string }> = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendSms(phoneNumber, message);
        results.push({ phoneNumber, success: true, data: result });
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

export default new SmsService();

