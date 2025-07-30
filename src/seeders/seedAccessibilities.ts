import { Accessibility } from '@/types/misc';
import AccessibilityModel from '@models/Accessibility';

export class AccessibilitySeeder {
    private readonly defaultAccessibilities: Accessibility[] = [
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

    private async logStatistics() {
        const count = await AccessibilityModel.countDocuments();
        const categories = await AccessibilityModel.aggregate([
            {
                $group: {
                    _id: null,
                    features: { $push: '$name' }
                }
            }
        ]);
        
        console.log('\nAccessibility Statistics:');
        console.log(`Total Features: ${count}`);
        console.log('Available Features:', categories[0]?.features.join(', '));
    }

    private async checkExisting(accessibility: Accessibility): Promise<boolean> {
        const exists = await AccessibilityModel.findOne({
            $or: [
                { value: accessibility.value },
                { 
                    name: accessibility.name,
                    description: accessibility.description 
                }
            ]
        });
        return !!exists;
    }

    public async seed() {
        try {
            console.log('Checking existing accessibility options...');
            let skipped = 0;
            let updated = 0;
            let created = 0;

            for (const accessibility of this.defaultAccessibilities) {
                const exists = await this.checkExisting(accessibility);
                if (exists) {
                    console.log(`Skipping existing accessibility: ${accessibility.name} (${accessibility.value})`);
                    skipped++;
                    continue;
                }

                await AccessibilityModel.updateOne(
                    { value: accessibility.value },
                    { ...accessibility, isActive: true },
                    { upsert: true }
                );

                if (await this.checkExisting(accessibility)) {
                    updated++;
                } else {
                    created++;
                }
            }

            console.log('\nAccessibility options seeding completed:');
            console.log(`  Created: ${created}`);
            console.log(`  Updated: ${updated}`);
            console.log(`  Skipped: ${skipped}`);
            await this.logStatistics();
        } catch (error) {
            console.error('Error seeding accessibility options:', error);
            throw error;
        }
    }
}

if (require.main === module) {
    const seeder = new AccessibilitySeeder();
    seeder.seed();
} 