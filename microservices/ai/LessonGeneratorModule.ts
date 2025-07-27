import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILessonContent } from './types/lesson';
import mongoose from 'mongoose';
import LessonContent from './models/LessonContent';

export class LessonGeneratorModule {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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

    async generateAndStoreLessonContent(
        userRequest: string,
        userId: string,
        lessonId: string
    ): Promise<ILessonContent[]> {
        try {
            // Form a proper topic from user request
            const topic = await this.formTopicFromUserRequest(userRequest);
            
            // Generate title and description
            const { title: lessonTitle, description } = await this.generateTitle(userRequest, topic);
            
            // Generate outline
            const outline = await this.generateOutline(userRequest, topic, lessonTitle);
            
            // Generate and store content for each section
            const contentPromises = outline.map(async (sectionTitle, index) => {
                const content = await this.generateContent(userRequest, topic, sectionTitle);
                
                const lessonContent = new LessonContent({
                    lessonId: new mongoose.Types.ObjectId(lessonId),
                    userId: new mongoose.Types.ObjectId(userId),
                    title: sectionTitle,
                    description: index === 0 ? description : `Section ${index + 1} of ${lessonTitle}`,
                    sequenceNumber: index + 1,
                    content: content,
                    completionStatus: 'not_started',
                    currentProgress: 0,
                    lastAccessedAt: null
                });

                return lessonContent.save();
            });

            return Promise.all(contentPromises);
        } catch (error) {
            console.error('Error generating lesson content:', error);
            throw error;
        }
    }
} 