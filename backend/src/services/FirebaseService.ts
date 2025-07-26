import admin from 'firebase-admin';
import path from 'path';

class FirebaseService {
    private static instance: FirebaseService;
    private initialized = false;

    private constructor() {
        this.initializeApp();
    }

    public static getInstance(): FirebaseService {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }

    private initializeApp(): void {
        console.log('Initializing Firebase app');
        if (!this.initialized && !admin.apps.length) {
            const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            this.initialized = true;
        }
    }

    public async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        try {
            return await admin.auth().verifyIdToken(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

export default FirebaseService.getInstance(); 