import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILessonContent } from './types/lesson';
import mongoose from 'mongoose';
import LessonContent from './models/LessonContent';
import Lesson from './models/Lesson';

export class LessonGeneratorModule {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly MAX_RETRIES = 3;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    private extractJsonFromResponse(response: string): any {
        try {
            return JSON.parse(response.trim());
        } catch {
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }
            throw new Error('No valid JSON found in response');
        }
    }

    private async retryOperation<T>(
        operation: () => Promise<T>,
        context: string,
        maxRetries: number = this.MAX_RETRIES
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`Attempt ${attempt}/${maxRetries} failed for ${context}:`, error);

                if (attempt === maxRetries) {
                    console.error(`All ${maxRetries} attempts failed for ${context}`);
                    throw lastError;
                }

                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError || new Error('Unexpected error in retry logic');
    }

    async formTopicFromUserRequest(userRequest: string): Promise<string> {
        console.log("Forming topic from user request");
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
        console.log("Generating title");
        const prompt = {
            task: "generate_lesson_title",
            context: {
                userRequest,
                topic,
                requirements: {
                    title: "Should be comprehensive and educational",
                    description: "Should be brief but informative"
                }
            },
            output_format: {
                type: "json",
                fields: {
                    title: "string",
                    description: "string"
                }
            },
            example_response: {
                title: "Understanding React Hooks: A Comprehensive Guide",
                description: "A deep dive into React Hooks, covering their purpose, common use cases, and best practices for modern React development."
            }
        };

        const result = await this.model.generateContent(JSON.stringify(prompt));
        return this.extractJsonFromResponse(result.response.text());
    }

    async generatePlan(userRequest: string): Promise<{ topic: string; title: string; description: string; outline: Array<{ sequenceNumber: number; title: string }> }> {
        console.log("Generating consolidated plan (topic, title, description, outline)");
        const prompt = {
            task: "generate_lesson_plan",
            context: {
                userRequest,
                requirements: {
                    title: "Comprehensive and educational",
                    description: "Brief but informative",
                    outline: {
                        sectionCount: "Between 3-7 sections",
                        coverage: "All important aspects from user request",
                        structure: "Logical progression from basics to advanced",
                        sequencing: "Each section must have a sequence number indicating its order"
                    }
                }
            },
            output_format: {
                type: "json",
                fields: {
                    topic: "string - concise educational topic name",
                    title: "string - comprehensive lesson title",
                    description: "string - brief informative description",
                    outline: "array of objects { sequenceNumber: number, title: string }"
                },
                example: {
                    topic: "React Hooks Fundamentals",
                    title: "Understanding React Hooks: A Comprehensive Guide",
                    description: "A deep dive into React Hooks, covering their purpose, common use cases, and best practices for modern React development.",
                    outline: [
                        { sequenceNumber: 1, title: "Introduction to React Hooks" },
                        { sequenceNumber: 2, title: "Understanding useState" },
                        { sequenceNumber: 3, title: "Effect Hook Deep Dive" }
                    ]
                }
            }
        };

        const result = await this.model.generateContent(JSON.stringify(prompt));
        return this.extractJsonFromResponse(result.response.text());
    }

    async generateOutline(userRequest: string, topic: string, title: string): Promise<Array<{ sequenceNumber: number; title: string }>> {
        console.log("Generating outline");
        const prompt = {
            task: "generate_lesson_outline",
            context: {
                userRequest,
                topic,
                title,
                requirements: {
                    sectionCount: "Between 3-7 sections",
                    coverage: "All important aspects from user request",
                    structure: "Logical progression from basics to advanced",
                    sequencing: "Each section must have a sequence number indicating its order"
                }
            },
            output_format: {
                type: "json",
                structure: "array of objects with sequenceNumber and title",
                example: [
                    { sequenceNumber: 1, title: "Introduction to React Hooks" },
                    { sequenceNumber: 2, title: "Understanding useState" },
                    { sequenceNumber: 3, title: "Effect Hook Deep Dive" }
                ]
            }
        };

        const result = await this.model.generateContent(JSON.stringify(prompt));
        return this.extractJsonFromResponse(result.response.text());
    }

    async generateContent(userRequest: string, topic: string, sectionTitle: string): Promise<{ content: string; estimatedTime: number }> {
        return this.retryOperation(async () => {
            console.log(`Generating content for: ${sectionTitle}`);
            const prompt = {
                task: "generate_section_content_with_time",
                context: {
                    userRequest,
                    topic,
                    sectionTitle,
                    requirements: {
                        content: {
                            style: "Educational and clear",
                            elements: ["Explanations", "Examples", "Practical applications"],
                            focus: "Direct answers to user's learning goals"
                        },
                        timeEstimation: {
                            factors: {
                                reading: "Base reading time",
                                explanation: "Time for concept explanation",
                                examples: "Time for working through examples",
                                discussion: "Interactive elements"
                            }
                        }
                    }
                },
                output_format: {
                    type: "json",
                    fields: {
                        content: "string with markdown formatting",
                        estimatedSeconds: "number - time in seconds to cover this content"
                    }
                }
            };

            const result = await this.model.generateContent(JSON.stringify(prompt));
            const response = this.extractJsonFromResponse(result.response.text());

            if (typeof response.estimatedSeconds !== 'number' || response.estimatedSeconds <= 0) {
                const wordCount = response.content.split(/\s+/).length;
                response.estimatedSeconds = Math.round((wordCount / 150) * 90);
            }

            return {
                content: response.content,
                estimatedTime: response.estimatedSeconds
            };
        }, `content generation for section: ${sectionTitle}`);
    }

    async generateAndStoreLessonContent(
        userRequest: string,
        userId: string,
        languageCode: string
    ): Promise<{ lesson: any, contents: ILessonContent[] }> {
        console.log("Starting lesson generation process");
        try {
            const plan = await this.retryOperation(
                () => this.generatePlan(userRequest),
                'plan generation'
            );

            const lesson = new Lesson({
                title: plan.title,
                description: plan.description,
                difficulty: 'beginner',
                estimatedTime: 0,
                userId: new mongoose.Types.ObjectId(userId),
                userRequest,
                generatingStatus: 'in_progress',
                languageCode
            });
            
            const savedLesson = await lesson.save();
            console.log("Lesson created:", savedLesson._id);

            const outline = plan.outline;
            console.log("Outline generated with", outline.length, "sections");

            // Step 4: Generate and store content sections in parallel
            const generatedContents = await Promise.all(
                outline.map(async (section) => {
                    const contentResult = await this.generateContent(userRequest, plan.topic, section.title);
                    return {
                        lessonId: savedLesson._id,
                        userId: new mongoose.Types.ObjectId(userId),
                        title: section.title,
                        description: section.sequenceNumber === 1 ? plan.description : `Section ${section.sequenceNumber} of ${plan.title}`,
                        sequenceNumber: section.sequenceNumber,
                        content: contentResult.content,
                        completionStatus: 'not_started',
                        currentProgress: 0,
                        lastAccessedAt: null
                    };
                })
            );

            // Step 5: Bulk insert contents to minimize DB round-trips
            const savedContents = await LessonContent.insertMany(generatedContents, { ordered: false });
            console.log("All content sections saved:", savedContents.length);

            // Step 6: Update lesson with total estimated time
            const totalEstimatedTime = savedContents.reduce((total, content) => {
                const wordCount = content.content.split(/\s+/).length;
                return total + Math.round((wordCount / 150) * 90);
            }, 0);

            savedLesson.estimatedTime = totalEstimatedTime;
            savedLesson.generatingStatus = 'completed';
            await savedLesson.save();
            console.log("Lesson updated with total time:", totalEstimatedTime);

            return {
                lesson: savedLesson.toObject(),
                contents: savedContents
            };
        } catch (error) {
            console.error('Error in lesson generation process:', error);
            throw error;
        }
    }
} 