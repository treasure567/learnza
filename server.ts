
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationRoutes from './routes/notificationRoutes';
import { FirebaseService } from './services/FirebaseService';
import { EmailService } from './services/EmailService';

dotenv.config();

// Initialize services
FirebaseService.initialize();
EmailService.initialize();

const app = express();
const port = process.env.NOTIFICATION_SERVICE_PORT;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri as string)
    .then(() => {
        console.log('Notifications Service connected to MongoDB');
        
        // Start server
        app.listen(port, () => {
            console.log(`Notifications microservice running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Notifications Service MongoDB connection error:', error);
        process.exit(1);
    }); 