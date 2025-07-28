import mongoose from 'mongoose';
import Task from '@/models/Task';

interface TaskConfig {
    category: string;
    titleTemplate: string;
    descriptionTemplate: string;
    getRequiredCount: (level: number) => number;
    getPoints: (level: number) => number;
}

export class TaskSeeder {
    private readonly levelNames = [
        'Newbie', 'Explorer', 'Apprentice', 'Learner', 'Rising Scholar', 'Curious Mind', 'Student', 'Dedicated Learner',
        'Knowledge Seeker', 'Active Scholar', 'Persistent Student', 'Growth Starter', 'Knowledge Adventurer', 'Smart Thinker',
        'Idea Hunter', 'Mind Opener', 'Focus Achiever', 'Bright Mind', 'Skill Builder', 'Skill Sharer', 'Topic Master',
        'Insight Collector', 'Advanced Learner', 'Wisdom Collector', 'Diligent Mind', 'Goal Getter', 'Focused Explorer',
        'Learning Guide', 'Subject Sprinter', 'Level Climber', 'Intellect Driver', 'Critical Thinker', 'Learning Champion',
        'Mastermind', 'Fast Mover', 'Learning Hero', 'Topic Crusher', 'Learning Guru', 'Subject Specialist', 'Knowledge Knight',
        'Topic Wizard', 'Topic Captain', 'Education Builder', 'Education Warrior', 'Wisdom Rider', 'Topic Hero', 'Subject General',
        'Mind Shifter', 'Learning Shifter', 'Skill Maker', 'Knowledge Maker', 'Learning Machine', 'Growth Pioneer', 'Learning Pioneer',
        'Wisdom Pioneer', 'Knowledge Creator', 'Mind Master', 'Subject Master', 'Subject Hero', 'Master Scholar', 'Topic Commander',
        'Grand Scholar', 'Learning Commander', 'Intellect Commander', 'Wisdom Commander', 'Subject Giant', 'Knowledge Giant',
        'Learning Giant', 'Education King', 'Wisdom King', 'Knowledge King', 'Learning King', 'Learning Emperor', 'Wisdom Emperor',
        'Knowledge Emperor', 'Education Emperor', 'Master Guru', 'Grand Guru', 'Mega Guru', 'Learning Sage', 'Wisdom Sage',
        'Education Sage', 'Knowledge Sage', 'Learning Oracle', 'Wisdom Oracle', 'Knowledge Oracle', 'Learning Legend', 'Wisdom Legend',
        'Knowledge Legend', 'Education Legend', 'Ultimate Scholar', 'Ultimate Master', 'Ultimate Guru', 'Ultimate Sage',
        'Grandmaster Scholar', 'Grandmaster Sage', 'Grandmaster Guru', 'Grandmaster Legend'
    ];

    private readonly taskConfigs: TaskConfig[] = [
        {
            category: 'LESSON',
            titleTemplate: 'Generate {count} lessons',
            descriptionTemplate: 'Create a total of {count} lessons',
            getRequiredCount: (level) => Math.floor(level * 1.5) + 3,
            getPoints: (level) => Math.floor(level * 50) + 50
        },
        {
            category: 'CONTENT',
            titleTemplate: 'Complete {count} contents',
            descriptionTemplate: 'Complete {count} lesson contents',
            getRequiredCount: (level) => Math.floor(level * 1.2) + 2,
            getPoints: (level) => Math.floor(level * 60) + 60
        },
        {
            category: 'STREAK',
            titleTemplate: 'Login streak - {count} days',
            descriptionTemplate: 'Login for {count} consecutive days',
            getRequiredCount: (level) => Math.floor(level * 0.8) + 2,
            getPoints: (level) => Math.floor(level * 40) + 40
        },
        {
            category: 'ACHIEVEMENT',
            titleTemplate: '{levelName}',
            descriptionTemplate: 'Reach level {level} and become a {levelName}',
            getRequiredCount: () => 1,
            getPoints: (level) => Math.floor(level * 100) + 100
        }
    ];

    private generateTask(
        config: TaskConfig,
        level: number,
        order: number,
        levelName: string
    ) {
        const count = config.getRequiredCount(level);
        const points = config.getPoints(level);

        const title = config.category === 'STREAK' 
            ? `Level ${level} - ${config.titleTemplate.replace('{count}', count.toString())}`
            : config.titleTemplate.replace('{count}', count.toString()).replace('{levelName}', levelName);

        return {
            title,
            description: config.descriptionTemplate
                .replace('{count}', count.toString())
                .replace('{level}', level.toString())
                .replace('{levelName}', levelName),
            points,
            requiredCount: count,
            category: config.category,
            level,
            order
        };
    }

    private async checkExisting(task: any): Promise<boolean> {
        const exists = await Task.findOne({
            $or: [
                { title: task.title },
                {
                    category: task.category,
                    level: task.level,
                    requiredCount: task.requiredCount,
                    order: task.order
                }
            ]
        });
        return !!exists;
    }

    private generateTasks() {
        const tasks: any[] = [];
        let order = 1;

        for (let level = 1; level <= 100; level++) {
            const levelName = this.levelNames[level - 1];
            this.taskConfigs.forEach(config => {
                tasks.push(this.generateTask(config, level, order++, levelName));
            });
        }

        return tasks;
    }

    private async addPrerequisites() {
        const dbTasks = await Task.find().sort({ order: 1 });
        
        for (let i = 0; i < dbTasks.length; i++) {
            const task = dbTasks[i];
            const prerequisites = [];

            if (task.level > 1) {
                const prevLevelTasks = dbTasks
                    .filter(t => 
                        t.level === task.level - 1 && 
                        t.category === task.category
                    );
                prerequisites.push(...prevLevelTasks.map(t => t._id));
            }

            if (prerequisites.length > 0) {
                await Task.findByIdAndUpdate(task._id, { prerequisites });
            }
        }
    }

    private async logStatistics() {
        const stats = await Task.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalPoints: { $sum: '$points' },
                    avgPointsPerTask: { $avg: '$points' }
                }
            }
        ]);
        
        console.log('\nTask Statistics:');
        stats.forEach(stat => {
            console.log(`${stat._id}:`);
            console.log(`  Count: ${stat.count}`);
            console.log(`  Total Points: ${stat.totalPoints}`);
            console.log(`  Avg Points/Task: ${Math.round(stat.avgPointsPerTask)}`);
        });
    }

    public async seed() {
        try {
            console.log('Checking existing tasks...');
            const tasks = this.generateTasks();
            let skipped = 0;
            let updated = 0;
            let created = 0;

            for (const task of tasks) {
                try {
                    const exists = await this.checkExisting(task);
                    if (exists) {
                        console.log(`Skipping existing task: ${task.title} (Level ${task.level}, ${task.category})`);
                        skipped++;
                        continue;
                    }

                    await Task.updateOne(
                        { title: task.title },
                        task,
                        { upsert: true }
                    );

                    if (await this.checkExisting(task)) {
                        updated++;
                    } else {
                        created++;
                    }
                } catch (error: any) {
                    if (error.code === 11000) {
                        console.log(`Skipping duplicate task: ${task.title}`);
                        skipped++;
                        continue;
                    }
                    throw error;
                }
            }

            console.log('\nTasks seeding completed:');
            console.log(`  Created: ${created}`);
            console.log(`  Updated: ${updated}`);
            console.log(`  Skipped: ${skipped}`);

            if (created > 0 || updated > 0) {
                console.log('\nUpdating prerequisites...');
                await this.addPrerequisites();
            }

            await this.logStatistics();
        } catch (error) {
            console.error('Error seeding tasks:', error);
            throw error;
        }
    }
}

if (require.main === module) {
    const seeder = new TaskSeeder();
    seeder.seed();
} 