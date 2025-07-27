import { Language, Accessibility } from '@/types/misc';
import LanguageModel from '@models/Language';
import AccessibilityModel from '@models/Accessibility';
import { CustomError } from '@middleware/errorHandler';

class MiscService {
    private static instance: MiscService;
    private initialized = false;

    private constructor() {
        this.initialize();
    }

    public static getInstance(): MiscService {
        if (!MiscService.instance) {
            MiscService.instance = new MiscService();
        }
        return MiscService.instance;
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;

        console.log('Initializing MiscService - Seeding data');
        try {
            const [languageCount, accessibilityCount] = await Promise.all([
                LanguageModel.countDocuments(),
                AccessibilityModel.countDocuments()
            ]);

            if (languageCount === 0) {
                await this.seedLanguages();
            }
            if (accessibilityCount === 0) {
                await this.seedAccessibilities();
            }
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize MiscService:', error);
        }
    }

    private async seedLanguages(): Promise<void> {
        const defaultLanguages: Language[] = [
            {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                region: 'Global'
            },
            {
                code: 'yo',
                name: 'Yoruba',
                nativeName: 'Yorùbá',
                region: 'Nigeria'
            },
            {
                code: 'ha',
                name: 'Hausa',
                nativeName: 'Harshen Hausa',
                region: 'Nigeria'
            },
            {
                code: 'ig',
                name: 'Igbo',
                nativeName: 'Asụsụ Igbo',
                region: 'Nigeria'
            },
            {
                code: 'pcm',
                name: 'Nigerian Pidgin',
                nativeName: 'Naijá',
                region: 'Nigeria'
            },
            {
                code: 'fuv',
                name: 'Fulfulde',
                nativeName: 'Fulfulde',
                region: 'Nigeria'
            },
            {
                code: 'kcg',
                name: 'Tyap',
                nativeName: 'Tyap',
                region: 'Nigeria'
            },
            {
                code: 'tiv',
                name: 'Tiv',
                nativeName: 'Tiv',
                region: 'Nigeria'
            },
            {
                code: 'ibb',
                name: 'Ibibio',
                nativeName: 'Ibibio',
                region: 'Nigeria'
            },
            {
                code: 'edo',
                name: 'Edo',
                nativeName: 'Ẹ̀dó',
                region: 'Nigeria'
            },
            {
                code: 'kau',
                name: 'Kanuri',
                nativeName: 'Kanuri',
                region: 'Nigeria'
            }
        ];

        try {
            const operations = defaultLanguages.map(language => ({
                updateOne: {
                    filter: { code: language.code },
                    update: { ...language, isActive: true },
                    upsert: true
                }
            }));

            await LanguageModel.bulkWrite(operations);
        } catch (error) {
            throw new CustomError('Failed to seed languages', 500);
        }
    }

    private async seedAccessibilities(): Promise<void> {
        const defaultAccessibilities: Accessibility[] = [
            {
                value: 'signLanguage',
                name: 'Sign Language',
                description: 'Needs sign language translation or overlay'
            },
            {
                value: 'textToSpeech',
                name: 'Text to Speech',
                description: 'Needs lessons read out loud automatically'
            },
            {
                value: 'speechToText',
                name: 'Speech to Text',
                description: 'Needs audio/video lessons transcribed'
            },
            {
                value: 'highContrast',
                name: 'High Contrast',
                description: 'Needs high contrast UI for low vision'
            },
            {
                value: 'largeText',
                name: 'Large Text',
                description: 'Needs larger text / bigger fonts'
            },
            {
                value: 'captions',
                name: 'Captions',
                description: 'Needs closed captions for videos'
            },
            {
                value: 'audioDescription',
                name: 'Audio Description',
                description: 'Needs audio description of visuals'
            },
            {
                value: 'keyboardOnly',
                name: 'Keyboard Only',
                description: 'Needs to navigate fully by keyboard (no mouse)'
            },
            {
                value: 'slowMode',
                name: 'Slow Mode',
                description: 'Needs extra time / reduced animations'
            }
        ];

        try {
            const operations = defaultAccessibilities.map(accessibility => ({
                updateOne: {
                    filter: { value: accessibility.value },
                    update: { ...accessibility, isActive: true },
                    upsert: true
                }
            }));

            await AccessibilityModel.bulkWrite(operations);
        } catch (error) {
            throw new CustomError('Failed to seed accessibilities', 500);
        }
    }

    public async getLanguages(): Promise<Language[]> {
        await this.initialize();
        return LanguageModel.find({ isActive: true });
    }

    public async getAccessibilities(): Promise<Accessibility[]> {
        await this.initialize();
        return AccessibilityModel.find({ isActive: true });
    }
}

export default MiscService.getInstance(); 