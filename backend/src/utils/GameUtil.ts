import { Types } from 'mongoose';
import User from '@/models/User';
import Task from '@/models/Task';
import { CompletedTask } from '@/types/user';

export class GameUtil {
    private static readonly POINTS_PER_LEVEL = 1000;
    private static readonly MAX_STREAK_HOURS = 36;

    static calculateLevel(points: number): number {
        return Math.floor(points / this.POINTS_PER_LEVEL) + 1;
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
        return user.loginStreak;
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

    static async updateTaskProgress(
        userId: Types.ObjectId,
        taskId: Types.ObjectId,
        increment: number = 1
    ): Promise<{ completed: boolean; newPoints: number }> {
        const [user, task] = await Promise.all([
            User.findById(userId),
            Task.findById(taskId)
        ]);

        if (!user || !task) throw new Error('User or task not found');

        const isPrerequisitesMet = await this.checkTaskPrerequisites(userId, taskId);
        if (!isPrerequisitesMet) throw new Error('Task prerequisites not met');

        let userTask = user.completedTasks.find((ct: CompletedTask) => ct.task.toString() === taskId.toString());

        if (!userTask) {
            userTask = {
                task: taskId,
                count: 0,
                completedAt: new Date()
            };
            user.completedTasks.push(userTask);
        }

        userTask.count += increment;
        const isNewlyCompleted = userTask.count >= task.requiredCount && 
            userTask.count - increment < task.requiredCount;

        if (isNewlyCompleted) {
            user.totalPoints += task.points;
            const newLevel = this.calculateLevel(user.totalPoints);
            if (newLevel > user.level) {
                user.level = newLevel;
            }
            userTask.completedAt = new Date();
        }

        await user.save();
        return {
            completed: isNewlyCompleted,
            newPoints: user.totalPoints
        };
    }

    static async getAvailableTasks(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const completedTaskIds = user.completedTasks
            .filter((ct: CompletedTask) => ct.count >= 1)
            .map((ct: CompletedTask) => ct.task.toString());

        const tasks = await Task.find({
            $or: [
                { prerequisites: { $size: 0 } },
                { prerequisites: { $not: { $elemMatch: { $nin: completedTaskIds } } } }
            ]
        }).sort({ level: 1, order: 1 });

        return tasks.map(t => t._id);
    }
}

export default GameUtil; 