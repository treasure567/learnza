import { Language, Accessibility } from '@/types/misc';
import LanguageModel from '@/models/Language';
import AccessibilityModel from '@/models/Accessibility';
import { CustomError } from '@middleware/errorHandler';

class MiscService {
    private static instance: MiscService;

    public static getInstance(): MiscService {
        if (!MiscService.instance) {
            MiscService.instance = new MiscService();
        }
        return MiscService.instance;
    }

    public async getLanguages(): Promise<Language[]> {
        return LanguageModel.find({ isActive: true });
    }

    public async getAccessibilities(): Promise<Accessibility[]> {
        return AccessibilityModel.find({ isActive: true });
    }
}

export default MiscService.getInstance(); 