import { Language } from '@/types/misc';
import LanguageModel from '@models/Language';
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

        console.log('Initializing MiscService - Seeding languages');
        try {
            const languageCount = await LanguageModel.countDocuments();
            if (languageCount === 0) {
                await this.seedLanguages();
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

    public async getLanguages(): Promise<Language[]> {
        await this.initialize();
        return LanguageModel.find({ isActive: true });
    }
}

export default MiscService.getInstance(); 