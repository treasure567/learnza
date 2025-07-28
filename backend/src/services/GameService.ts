import { Types } from 'mongoose';
import User from '@models/User';
import Task from '@models/Task';
import { GameUtil } from '@utils/GameUtil';
import { CustomError } from '@middleware/errorHandler';
import { CompletedTask } from '@/types/user';

interface TaskProgress {
    category: string;
    completed: number;
    required: number;
    remainingCount: number;
    potentialPoints: number;
}

interface TaskSummary {
    task: any;
    progress: number;
    remainingCount: number;
    isCompleted: boolean;
    earnedPoints: number;
}

export class GameService {
    private static readonly POINTS_PER_LEVEL = 100;

    private static async populateTaskDetails(user: any): Promise<void> {
        const taskIds = user.completedTasks.map((t: CompletedTask) => t.task);
        const tasks = await Task.find({ _id: { $in: taskIds } });

        user.completedTasks.forEach((completedTask: CompletedTask) => {
            const task = tasks.find(t => t._id.toString() === completedTask.task.toString());
            if (task) {
                completedTask.requiredCount = task.requiredCount;
                completedTask.points = task.points;
            }
        });
    }

    static async getAvailableTasks(userId: Types.ObjectId): Promise<TaskSummary[]> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        await this.populateTaskDetails(user);

        const tasks = await Task.find({ 
            level: user.level,
            _id: { $nin: user.completedTasks.filter(t => 
                t.requiredCount !== undefined && t.count >= t.requiredCount
            ).map(t => t.task) }
        }).sort({ order: 1 });

        const availableTasks = [];
        for (const task of tasks) {
            const isPrerequisitesMet = await GameUtil.checkTaskPrerequisites(userId, task._id);
            if (isPrerequisitesMet) {
                const userTask = user.completedTasks.find(t => t.task.toString() === task._id.toString());
                availableTasks.push({
                    task,
                    progress: userTask ? (userTask.count / task.requiredCount) * 100 : 0,
                    remainingCount: userTask ? Math.max(0, task.requiredCount - userTask.count) : task.requiredCount,
                    isCompleted: userTask && userTask.requiredCount ? userTask.count >= userTask.requiredCount : false,
                    earnedPoints: userTask && userTask.requiredCount && userTask.count >= userTask.requiredCount ? task.points : 0
                });
            }
        }

        return availableTasks;
    }

    static async getCompletedTasks(userId: Types.ObjectId): Promise<TaskSummary[]> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        await this.populateTaskDetails(user);

        const completedTaskIds = user.completedTasks
            .filter(t => t.requiredCount !== undefined && t.count >= t.requiredCount)
            .map(t => t.task);

        const tasks = await Task.find({ 
            _id: { $in: completedTaskIds }
        }).sort({ level: 1, order: 1 });

        return tasks.map(task => {
            const userTask = user.completedTasks.find(t => t.task.toString() === task._id.toString());
            return {
                task,
                progress: 100,
                remainingCount: 0,
                isCompleted: true,
                earnedPoints: task.points
            };
        });
    }

    static async getTaskProgress(userId: Types.ObjectId): Promise<{
        currentLevel: number;
        totalPoints: number;
        nextLevelPoints: number;
        progress: TaskProgress[];
    }> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        await this.populateTaskDetails(user);

        const currentLevelTasks = await Task.find({ level: user.level });

        const progressByCategory = new Map<string, TaskProgress>();

        for (const task of currentLevelTasks) {
            const userTask = user.completedTasks.find(t => t.task.toString() === task._id.toString());
            const progress = progressByCategory.get(task.category) || {
                category: task.category,
                completed: 0,
                required: 0,
                remainingCount: 0,
                potentialPoints: 0
            };

            progress.required++;
            if (userTask && userTask.count >= task.requiredCount) {
                progress.completed++;
            } else {
                progress.remainingCount += task.requiredCount - (userTask?.count || 0);
                progress.potentialPoints += task.points;
            }

            progressByCategory.set(task.category, progress);
        }

        const nextLevelPoints = (user.level + 1) * this.POINTS_PER_LEVEL;

        return {
            currentLevel: user.level,
            totalPoints: user.totalPoints,
            nextLevelPoints,
            progress: Array.from(progressByCategory.values())
        };
    }
} 