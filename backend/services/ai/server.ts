import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { LessonGeneratorController } from './LessonGeneratorController';

// Load environment variables
config();

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize controller
const lessonGeneratorController = new LessonGeneratorController();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Routes
app.post('/generate', lessonGeneratorController.generateLessonContent);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnza')
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`AI Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 