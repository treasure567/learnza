import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { MicroserviceUtils, MicroService } from '@utils/MicroserviceUtils';


dotenv.config();

export class SpitchUtils {

    static async generateSpeech(payload: any): Promise<Readable> {
        const streamResponse: any = await MicroserviceUtils.post(
            MicroService.AI,
            '/speech',
            payload,
            { responseType: 'stream' }
        );

        return streamResponse;
    }
} 