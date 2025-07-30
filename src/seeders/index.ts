import mongoose from 'mongoose';
import { TaskSeeder } from './seedTasks';
import { LanguageSeeder } from './seedLanguages';
import { AccessibilitySeeder } from './seedAccessibilities';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseSeeder {
    private readonly seeders = {
        tasks: new TaskSeeder(),
        languages: new LanguageSeeder(),
        accessibilities: new AccessibilitySeeder()
    };

    public async seedAll() {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI!);
            for (const seeder of Object.values(this.seeders)) {
                console.log(`Seeding ${seeder.constructor.name}...`);
                await seeder.seed();
            }
            console.log('\nAll data seeded successfully!');
        } catch (error) {
            console.error('Error seeding database:', error);
            process.exit(1);
        } finally {
            await mongoose.disconnect();
        }
    }

    public async seedTasks() {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI!);

            console.log('\nSeeding tasks...');
            await this.seeders.tasks.seed();

            console.log('\nTasks seeded successfully!');
        } catch (error) {
            console.error('Error seeding tasks:', error);
            process.exit(1);
        } finally {
            await mongoose.disconnect();
        }
    }

    public async seedLanguages() {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI!);

            console.log('\nSeeding languages...');
            await this.seeders.languages.seed();

            console.log('\nLanguages seeded successfully!');
        } catch (error) {
            console.error('Error seeding languages:', error);
            process.exit(1);
        } finally {
            await mongoose.disconnect();
        }
    }

    public async seedAccessibilities() {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI!);

            console.log('\nSeeding accessibility options...');
            await this.seeders.accessibilities.seed();

            console.log('\nAccessibility options seeded successfully!');
        } catch (error) {
            console.error('Error seeding accessibility options:', error);
            process.exit(1);
        } finally {
            await mongoose.disconnect();
        }
    }
}

if (require.main === module) {
    const seeder = new DatabaseSeeder();
    const [,, command] = process.argv;

    switch (command) {
        case 'tasks':
            seeder.seedTasks();
            break;
        case 'languages':
            seeder.seedLanguages();
            break;
        case 'accessibilities':
            seeder.seedAccessibilities();
            break;
        case 'all':
        default:
            seeder.seedAll();
            break;
    }
}
