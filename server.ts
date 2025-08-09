
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import smsRoutes from './routes/smsRoutes';

dotenv.config();

const app = express();
const port = process.env.SMS_SERVICE_PORT || 4002;

app.use(cors());
app.use(bodyParser.json());

// Mount at /api so routes are /api/sms, /api/sms/bulk, /api/sms/health, /api/webhook
app.use('/api', smsRoutes);

// Health check endpoint
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

// Connect to MongoDB (if needed for future features)
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
    mongoose.connect(mongoUri as string)
        .then(() => {
            console.log('SMS Service connected to MongoDB');
        })
        .catch((error) => {
            console.error('SMS Service MongoDB connection error:', error);
        });
}

// Start server
app.listen(port, () => {
    console.log(`SMS microservice running on port ${port}`);
    console.log(`SMS endpoints available at:`);
    console.log(`  POST /api/sms - Send SMS (single or multiple)`);
    console.log(`  POST /api/sms/bulk - Send bulk SMS (optimized)`);
    console.log(`  GET  /api/sms/health - SMS service health check`);
    console.log(`  POST /api/webhook - Inbound SMS webhook (public)`);
}); 