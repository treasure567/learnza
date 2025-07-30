
import * as admin from 'firebase-admin';

export class FirebaseService {
    private static isInitialized = false;

    public static initialize() {
        if (this.isInitialized) {
            return;
        }

        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as admin.ServiceAccount;

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        this.isInitialized = true;
        console.log('Firebase Admin SDK initialized');
    }

    public static async sendPushNotification(token: string, title: string, body: string) {
        if (!this.isInitialized) {
            throw new Error('Firebase Admin SDK not initialized');
        }

        const message = {
            notification: {
                title,
                body,
            },
            token,
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
} 