import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILessonContent } from './types/lesson';
import mongoose from 'mongoose';
import LessonContent from './models/LessonContent';
import Lesson from './models/Lesson';

export class LessonGeneratorModule {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    private extractJsonFromResponse(response: string): any {
        // Remove markdown formatting if present
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }

        // Try to find JSON in the response
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = response.substring(jsonStart, jsonEnd + 1);
            return JSON.parse(jsonString);
        }

        throw new Error('No valid JSON found in response');
    }

    async formTopicFromUserRequest(userRequest: string): Promise<string> {
        const prompt = `Based on this user request: "${userRequest}", create a concise, educational topic title.
                       Return only the topic title as a string, no JSON formatting.
                       Examples:
                       - "i want to learn about kanuch map" → "Karnaugh Map (K-Map)"
                       - "teach me react hooks" → "React Hooks Fundamentals"
                       - "javascript promises" → "JavaScript Promises and Async Programming"`;

        const result = await this.model.generateContent(prompt);
        return result.response.text().trim();
    }

    async generateTitle(userRequest: string, topic: string): Promise<{ title: string; description: string }> {
        const prompt = `Based on the user request: "${userRequest}" and the topic: "${topic}", 
                       generate a comprehensive educational title and brief description for a lesson.
                       Return only a JSON object with this exact format: {"title": "Your Title Here", "description": "Your description here"}`;

        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        return this.extractJsonFromResponse(response);
    }

    async generateOutline(userRequest: string, topic: string, title: string): Promise<Array<string>> {
        const prompt = `Based on the user request: "${userRequest}", topic: "${topic}", and title: "${title}",
                       create a detailed table of contents for this lesson.
                       Return only a JSON array of section titles like this: ["Section 1", "Section 2", "Section 3"].
                       Keep it between 3-7 sections, covering all important aspects the user wants to learn.`;

        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
        return this.extractJsonFromResponse(response);
    }

    async generateContent(userRequest: string, topic: string, sectionTitle: string): Promise<string> {
        const prompt = `Based on the user request: "${userRequest}" and topic: "${topic}",
                       generate detailed, educational content for the section "${sectionTitle}".
                       Focus on clarity, examples, and practical applications that directly address what the user wants to learn.
                       Keep it concise but informative. Return only the content text, no formatting.`;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async estimateContentTime(content: string): Promise<number> {
        const prompt = `Based on this educational content: "${content}",
                       estimate how many seconds it would take for an AI to explain this content to a student.
                       Consider:
                       - Reading time for the content
                       - Time to explain concepts
                       - Time for examples and clarifications
                       - Interactive discussion time
                       
                       Return only a number representing seconds. No text, no JSON, just the number.
                       Example responses: 180, 240, 360`;

        const result = await this.model.generateContent(prompt);
        const timeText = result.response.text().trim();
        const timeSeconds = parseInt(timeText.replace(/[^\d]/g, ''));

        // Fallback calculation if AI doesn't return a valid number
        if (isNaN(timeSeconds) || timeSeconds <= 0) {
            // Rough estimate: 150 words per minute reading + 50% for explanation
            const wordCount = content.split(/\s+/).length;
            const readingTime = (wordCount / 150) * 60; // seconds
            return Math.round(readingTime * 1.5); // Add 50% for explanation
        }

        return timeSeconds;
    }

    async generateAndStoreLessonContent(
        userRequest: string,
        userId: string
    ): Promise<{ lesson: any, contents: ILessonContent[] }> {
        try {
            const topic = await this.formTopicFromUserRequest(userRequest);
            const { title: lessonTitle, description } = await this.generateTitle(userRequest, topic);

            const outline = await this.generateOutline(userRequest, topic, lessonTitle);

            const contentData = await Promise.all(
                outline.map(async (sectionTitle, index) => {
                    const content = await this.generateContent(userRequest, topic, sectionTitle);
                    const estimatedTime = await this.estimateContentTime(content);

                    return {
                        sectionTitle,
                        content,
                        estimatedTime,
                        index
                    };
                })
            );

            const totalEstimatedTime = contentData.reduce((total, item) => total + item.estimatedTime, 0);

            const lesson = new Lesson({
                title: lessonTitle,
                description: description,
                difficulty: 'beginner',
                estimatedTime: totalEstimatedTime,
                userId: new mongoose.Types.ObjectId(userId),
                userRequest: userRequest
            });

            const savedLesson = await lesson.save();

            const lessonContents = await Promise.all(
                contentData.map(async (item) => {
                    const lessonContent = new LessonContent({
                        lessonId: lesson._id,
                        userId: new mongoose.Types.ObjectId(userId),
                        title: item.sectionTitle,
                        description: item.index === 0 ? description : `Section ${item.index + 1} of ${lessonTitle}`,
                        sequenceNumber: item.index + 1,
                        content: item.content,
                        completionStatus: 'not_started',
                        currentProgress: 0,
                        lastAccessedAt: null
                    });
                    return lessonContent.save();
                })
            );

            return {
                lesson: savedLesson,
                contents: lessonContents
            };
        } catch (error) {
            console.error('Error generating lesson content:', error);
            throw error;
        }
    }
} 