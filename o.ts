import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function textToSpeech(text: string, outputFile: string) {
    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova", // Options: alloy, echo, fable, onyx, nova, shimmer
            input: text,
        });

        // Ensure the directory exists
        const dir = path.dirname(outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Convert the response to buffer and save to file
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputFile, buffer);
        
        console.log(`Audio file saved successfully to ${outputFile}`);
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

const sampleText = `Hi Treasure! Did you know that before the Von Neumann Architecture, computers were really tricky to change? Back then, engineers had to physically rewire the hardware just to make a computer do something different. Imagine having to rebuild your phone every time you wanted to open a new app!

Then came the stored program concept. This idea changed everything! It meant that both the instructions — the program — and the data could live together in the same memory. So instead of rewiring the machine, you could simply load a new program whenever you wanted!

This turned computers into flexible, powerful tools that could do millions of different things — just by swapping programs in and out of memory. It's the reason you can browse the web, play games, or write an essay all on the same device today!

So, the next time you open an app or update your operating system, remember — that's the stored program concept in action. Pretty amazing, right?`;

// Generate audio using OpenAI TTS
textToSpeech(sampleText, 'open.mp3')
    .then(() => console.log('OpenAI TTS conversion completed!'))
    .catch(error => console.error('Failed to convert text to speech:', error));
