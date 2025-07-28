
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import interactRoutes from './routes/interactRoutes';

dotenv.config();

const app = express();
const port = process.env.INTERACT_SERVICE_PORT || 4001;

app.use(cors());
app.use(bodyParser.json());

app.use('/interact', interactRoutes);

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

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri as string)
    .then(() => {
        console.log('Interact Service connected to MongoDB');
        
        // Start server
        app.listen(port, () => {
            console.log(`Interact microservice running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Interact Service MongoDB connection error:', error);
        process.exit(1);
    }); 