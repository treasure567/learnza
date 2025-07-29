import { Types } from 'mongoose';
import User from '@/models/User';
import Task from '@/models/Task';
import LessonContent from '@/models/LessonContent';
import { CompletedTask } from '@/types/user';

export class GameUtil {
    private static readonly POINTS_PER_LEVEL = 100;
    private static readonly MAX_STREAK_HOURS = 36;

    static calculateLevel(points: number): number {
        return Math.floor(points / this.POINTS_PER_LEVEL) + 1;
    }

    static async checkTaskPrerequisites(userId: Types.ObjectId, taskId: Types.ObjectId): Promise<boolean> {
        const [user, task] = await Promise.all([
            User.findById(userId),
            Task.findById(taskId).populate('prerequisites')
        ]);

        if (!user || !task) throw new Error('User or task not found');

        if (!task.prerequisites?.length) return true;

        const completedTaskIds = user.completedTasks.map((ct: CompletedTask) => ct.task.toString());
        return task.prerequisites.every(prereq =>
            completedTaskIds.includes(prereq._id.toString())
        );
    }

    static async updateLoginStreak(userId: Types.ObjectId): Promise<number> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const now = new Date();
        const lastLogin = user.lastLoginDate;

        if (!lastLogin) {
            user.loginStreak = 1;
        } else {
            const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastLogin <= this.MAX_STREAK_HOURS) {
                const isNextDay = now.getDate() !== lastLogin.getDate();
                if (isNextDay) {
                    user.loginStreak += 1;
                }
            } else {
                user.loginStreak = 1;
            }
        }

        user.lastLoginDate = now;
        await user.save();
        await this.updateTaskProgress(userId, 'STREAK');
        await this.updateTaskProgress(userId, 'ACHIEVEMENT');
        return user.loginStreak;
    }

    private static async getProgressCount(userId: Types.ObjectId, category: 'LESSON' | 'CONTENT' | 'STREAK' | 'ACHIEVEMENT', user: any): Promise<number> {
        switch (category) {
            case 'LESSON':
                return LessonContent.countDocuments({ userId });

            case 'CONTENT':
                return LessonContent.countDocuments({
                    userId,
                    completionStatus: 'completed'
                });

            case 'STREAK':
                return user.loginStreak;

            case 'ACHIEVEMENT':
                return user.level;

            default:
                return 0;
        }
    }

    static async updateTaskProgress(
        userId: Types.ObjectId,
        category: 'LESSON' | 'CONTENT' | 'STREAK' | 'ACHIEVEMENT'
    ): Promise<{
        taskCompleted: boolean;
        newPoints: number;
    }> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const task = await Task.findOne({
            category,
            level: user.level
        });

        if (!task) {
            return { taskCompleted: false, newPoints: user.totalPoints };
        }

        const existingCompletion = user.completedTasks.find(
            (ct: CompletedTask) => ct.task.toString() === task._id.toString()
        );

        if (existingCompletion && existingCompletion.count >= task.requiredCount) {
            return { taskCompleted: true, newPoints: user.totalPoints };
        }

        const progressCount = await this.getProgressCount(userId, category, user);

        if (progressCount >= task.requiredCount) {
            if (!existingCompletion) {
                user.completedTasks.push({
                    task: task._id,
                    count: progressCount,
                    completedAt: new Date(),
                    requiredCount: task.requiredCount,
                    points: task.points
                });
                user.totalPoints += task.points;
            }

            await user.save();
            await this.updateLevel(userId);
            return { taskCompleted: true, newPoints: user.totalPoints };
        }

        await this.updateLevel(userId);
        return { taskCompleted: false, newPoints: user.totalPoints };
    }

    static async updateLevel(userId: Types.ObjectId): Promise<{
        levelIncreased: boolean;
        newLevel: number;
        newPoints: number;
    }> {
        const categories: ('LESSON' | 'CONTENT' | 'STREAK' | 'ACHIEVEMENT')[] = ['LESSON', 'CONTENT', 'STREAK', 'ACHIEVEMENT'];
        
        const results = await Promise.all(
            categories.map(category => this.updateTaskProgress(userId, category))
        );

        const allCompleted = results.every(result => result.taskCompleted);

        if (allCompleted) {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            user.level += 1;
            await user.save();

            await this.updateTaskProgress(userId, 'ACHIEVEMENT');

            return {
                levelIncreased: true,
                newLevel: user.level,
                newPoints: user.totalPoints
            };
        }

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        return {
            levelIncreased: false,
            newLevel: user.level,
            newPoints: user.totalPoints
        };
    }
}

export default GameUtil; 