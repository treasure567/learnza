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
        // await play(audio);
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

const sampleText = `Hi Treasure! Did you know that before the Von Neumann Architecture, computers were really tricky to change? Back then, engineers had to physically rewire the hardware just to make a computer do something different. Imagine having to rebuild your phone every time you wanted to open a new app!

Then came the stored program concept. This idea changed everything! It meant that both the instructions — the program — and the data could live together in the same memory. So instead of rewiring the machine, you could simply load a new program whenever you wanted!

This turned computers into flexible, powerful tools that could do millions of different things — just by swapping programs in and out of memory. It's the reason you can browse the web, play games, or write an essay all on the same device today!

So, the next time you open an app or update your operating system, remember — that's the stored program concept in action. Pretty amazing, right?`;

const yorText = `Báwo ni Treasure! Ṣé o mọ̀ pé kí Von Neumann Architecture tó dé, kò rọrùn láti ṣàyípadà àwọn kọ̀mpútà? Ní àkókò yẹn, àwọn engineers ní láti tún ẹ̀rọ náà waya tuntun láti jẹ́ kí kọ̀mpútà ṣe ohun tí ó yàtọ̀. Rò ó pé o ní láti tún fóònù rẹ kọ́ tuntun ní gbogbo ìgbà tí o bá fẹ́ ṣí àpò tuntun!

Lẹ́yìn náà ni èrò stored program wá. Èrò yìí yí gbogbo nǹkan padà! Ó túmọ̀ sí pé àwọn ìtọ́sọ́nà — àwọn program — àti dátà lè wà papọ̀ nínú irú memory kan náà. Dípò kí o tún ẹ̀rọ náà waya tuntun, o lè kàn fi program tuntun sínú rẹ̀ ní ìgbàkúgbà tí o bá fẹ́!

Èyí sọ àwọn kọ̀mpútà di ẹ̀rọ tó ní agbára tó sì lè ṣe ọ̀pọ̀lọpọ̀ nǹkan — nípa kíkàn fi programs yọ tàbí fi wọ́n sínú memory. Ìdí nìyí tí o fi lè lọ sí íńtánẹ́ẹ̀tì, ṣe eré, tàbí kọ ìwé lórí ẹ̀rọ kan náà lóní!

Nítorí náà, ní ìgbà tí o bá ṣí àpò tuntun tàbí ṣe àyípadà operating system rẹ, rántí — pé stored program concept ló ń ṣiṣẹ́ níbẹ̀. Kò ya ní ìyanu bí?`;

// Generate English version
textToSpeech(sampleText, 'audio.mp3')
    .then(() => {
        console.log('English version completed!');
        return textToSpeech(yorText, 'yor.mp3');
    })
    .then(() => console.log('Yoruba version completed!'))
    .catch(error => console.error('Failed to convert text to speech:', error));
