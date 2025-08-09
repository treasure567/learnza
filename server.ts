
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationRoutes from './routes/notificationRoutes';
import { FirebaseService } from './services/FirebaseService';
import { EmailService } from './services/EmailService';

dotenv.config();

// Initialize services (conditionally to avoid blocking SMS/Gemini tests)
const hasFirebaseEnv = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);
if (hasFirebaseEnv) {
  try {
    FirebaseService.initialize();
  } catch (err) {
    console.warn('Skipping Firebase init due to error:', err);
  }
} else {
  console.warn('Skipping Firebase init: FIREBASE_* env vars not fully set');
}

const hasEmailEnv = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_FROM
);
if (hasEmailEnv) {
  try {
    EmailService.initialize();
  } catch (err) {
    console.warn('Skipping Email service init due to error:', err);
  }
} else {
  console.warn('Skipping Email service init: EMAIL_* env vars not fully set');
}

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

// Helper to start server
const startServer = () => {
    app.listen(port, () => {
        console.log(`Notifications microservice running on port ${port}`);
        console.log('Endpoints:');
        console.log('  POST /api/notifications/push');
        console.log('  POST /api/notifications/email');
        console.log('  POST /api/notifications/sms');
        console.log('  POST /api/notifications/sms/bulk');
        console.log('  GET  /api/notifications/sms/health');
        console.log('  POST /api/notifications/webhook');
    });
};

// Connect to MongoDB if MONGODB_URI is set; otherwise, start without DB
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
    mongoose.connect(mongoUri as string)
        .then(() => {
            console.log('Notifications Service connected to MongoDB');
            startServer();
        })
        .catch((error) => {
            console.error('Notifications Service MongoDB connection error (continuing without DB):', error);
            startServer();
        });
} else {
    console.warn('MONGODB_URI not set. Starting Notifications Service without database...');
    startServer();
}