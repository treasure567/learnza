import { Language } from '@/types/misc';
import LanguageModel from '@models/Language';

export class LanguageSeeder {
    private readonly defaultLanguages: Language[] = [
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
        }
    ];

    private async logStatistics() {
        const stats = await LanguageModel.aggregate([
            {
                $group: {
                    _id: '$region',
                    count: { $sum: 1 },
                    languages: { $push: '$name' }
                }
            }
        ]);
        
        console.log('\nLanguage Statistics:');
        stats.forEach(stat => {
            console.log(`${stat._id}:`);
            console.log(`  Count: ${stat.count}`);
            console.log(`  Languages: ${stat.languages.join(', ')}`);
        });
    }

    private async checkExisting(language: Language): Promise<boolean> {
        const exists = await LanguageModel.findOne({
            $or: [
                { code: language.code },
                { 
                    name: language.name,
                    nativeName: language.nativeName 
                }
            ]
        });
        return !!exists;
    }

    public async seed() {
        try {
            console.log('Checking existing languages...');
            let skipped = 0;
            let updated = 0;
            let created = 0;

            for (const language of this.defaultLanguages) {
                const exists = await this.checkExisting(language);
                if (exists) {
                    console.log(`Skipping existing language: ${language.name} (${language.code})`);
                    skipped++;
                    continue;
                }

                await LanguageModel.updateOne(
                    { code: language.code },
                    { ...language, isActive: true },
                    { upsert: true }
                );

                if (await this.checkExisting(language)) {
                    updated++;
                } else {
                    created++;
                }
            }

            console.log('\nLanguages seeding completed:');
            console.log(`  Created: ${created}`);
            console.log(`  Updated: ${updated}`);
            console.log(`  Skipped: ${skipped}`);
            await this.logStatistics();
        } catch (error) {
            console.error('Error seeding languages:', error);
            throw error;
        }
    }
}

if (require.main === module) {
    const seeder = new LanguageSeeder();
    seeder.seed();
} 