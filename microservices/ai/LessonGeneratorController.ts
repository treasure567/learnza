import { Request, Response } from 'express';
import { LessonGeneratorModule } from './LessonGeneratorModule';
import { config } from 'dotenv';
import { AuthRequest } from './middleware/authMiddleware';

config();

const lessonGenerator = new LessonGeneratorModule(process.env.GEMINI_API_KEY || '');

export class LessonGeneratorController {
    async generateLessonContent(req: AuthRequest, res: Response) {
        try {
            const { userRequest, userId } = req.body;

            // Validate required fields
            if (!userRequest || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: userRequest or userId'
                });
            }

            // Generate and store complete lesson with calculated estimated time
            const result = await lessonGenerator.generateAndStoreLessonContent(
                userRequest,
                userId
            );

            return res.status(200).json({
                success: true,
                message: 'Lesson generated and stored successfully',
                data: {
                    lesson: {
                        id: result.lesson._id,
                        title: result.lesson.title,
                        description: result.lesson.description,
                        difficulty: result.lesson.difficulty,
                        estimatedTime: result.lesson.estimatedTime,
                        userId: result.lesson.userId,
                        userRequest: result.lesson.userRequest,
                        createdAt: result.lesson.createdAt
                    },
                    contents: result.contents.map(content => ({
                        id: content._id,
                        title: content.title,
                        description: content.description,
                        sequenceNumber: content.sequenceNumber,
                        content: content.content
                    })),
                    totalSections: result.contents.length,
                    contentEstimatedTimes: result.lesson.contents.map((content: any) => ({
                        title: content.title,
                        estimatedTime: content.estimatedTime
                    }))
                }
            });

        } catch (error: any) {
            console.error('Error in generateLessonContent:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error generating lesson content'
            });
        }
    }
} 