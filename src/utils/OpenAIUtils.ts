import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

export class OpenAIUtils {
    private static openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    static async generateAudio(text: string): Promise<string> {
        const response = await this.openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const audioDir = path.join(__dirname, '..', '..', 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const fileName = `${uuidv4()}.mp3`;
        const filePath = path.join(audioDir, fileName);

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        return fileName;
    }

    static async generateSpeech(text: string): Promise<Readable> {
        const response = await this.openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        if (!response.body) {
            throw new Error('No audio stream received from OpenAI');
        }

        const audioStream = Readable.from(response.body);

        return audioStream;
    }
} 