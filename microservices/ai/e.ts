import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import 'dotenv/config';

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY
});

const VOICE_ID = 'zwbf3iHXH6YGoTCPStfx';

async function textToSpeech(text: string, outputFile: string) {
    if (!process.env.ELEVEN_LABS_API_KEY) {
        throw new Error('ELEVEN_LABS_API_KEY environment variable is not set');
    }

    try {
        const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
            text,
            modelId: 'eleven_multilingual_v2',
            outputFormat: 'mp3_44100_128',
        });

        const dir = path.dirname(outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const reader = audio.getReader();
        const nodeStream = new Readable({
            async read() {
                try {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.push(null);
                    } else {
                        this.push(Buffer.from(value));
                    }
                } catch (error) {
                    this.destroy(error as Error);
                }
            }
        });

        const writeStream = fs.createWriteStream(outputFile);
        await new Promise((resolve, reject) => {
            nodeStream.pipe(writeStream);
            nodeStream.on('end', resolve);
            nodeStream.on('error', reject);
            writeStream.on('error', reject);
        });

        console.log(`Audio file saved successfully to ${outputFile}`);
        
        await play(audio);
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

const sampleText = `Hi Treasure, 👋 [playful] Did you know that before the Von Neumann Architecture, computers were really tricky to change? Back then, engineers had to physically rewire the hardware just to make a computer do something different — [sarcastically] imagine having to rebuild your phone every time you wanted to open a new app! [giggles]

Then came the stored program concept. 📚 [excited] This idea changed everything! It meant that both the instructions — the program — and the data could live together in the same memory. So instead of rewiring the machine, [relieved] you could simply load a new program whenever you wanted!

This turned computers into flexible, powerful tools that could do millions of different things — just by swapping programs in and out of memory. [in awe] It's the reason you can browse the web, play games, or write an essay all on the same device today!

[whispers] So, the next time you open an app or update your operating system, remember — that's the stored program concept in action. [playful] Pretty amazing, right? 💡 [giggles]`;

textToSpeech(sampleText, 'audio.mp3')
    .then(() => console.log('Text-to-speech conversion completed!'))
    .catch(error => console.error('Failed to convert text to speech:', error));
