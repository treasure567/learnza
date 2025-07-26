import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Application = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI!;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

app.use('/api/auth', authRoutes); 