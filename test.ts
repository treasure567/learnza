import { config } from 'dotenv';
import mongoose from 'mongoose';
import { LessonGeneratorModule } from './LessonGeneratorModule';

// Load environment variables
config();

async function testLessonGeneration() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnza');
        console.log('Connected to MongoDB');

        // Initialize the lesson generator
        const lessonGenerator = new LessonGeneratorModule(process.env.GEMINI_API_KEY || '');

        // Test data
        const testData = {
            userRequest: "i want to learn about kanuch map",
            userId: new mongoose.Types.ObjectId().toString(),
            lessonId: new mongoose.Types.ObjectId().toString()
        };

        console.log('Starting lesson generation with test data:', testData);

        // Generate lesson content
        const result = await lessonGenerator.generateAndStoreLessonContent(
            testData.userRequest,
            testData.userId,
            testData.lessonId
        );

        console.log('Successfully generated lesson content:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error in test:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testLessonGeneration(); 