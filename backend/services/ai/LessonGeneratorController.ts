import { Request, Response } from 'express';
import { LessonGeneratorModule } from './LessonGeneratorModule';
import { config } from 'dotenv';

config();

const lessonGenerator = new LessonGeneratorModule(process.env.GEMINI_API_KEY || '');

export class LessonGeneratorController {
    async generateLessonContent(req: Request, res: Response) {
        try {
            const { userRequest, userId, lessonId } = req.body;

            // Validate required fields
            if (!userRequest || !userId || !lessonId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: userRequest, userId, or lessonId'
                });
            }

            // Generate and store lesson content using userRequest
            const lessonContents = await lessonGenerator.generateAndStoreLessonContent(
                userRequest,
                userId,
                lessonId
            );

            return res.status(200).json({
                success: true,
                message: 'Lesson content generated successfully',
                data: lessonContents
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