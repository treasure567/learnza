export class RateLimitUtils {
    static canResendOtp(lastSentTime: Date | null, cooldownMinutes: number = 3): boolean {
        if (!lastSentTime) return true;

        const cooldownMs = cooldownMinutes * 60 * 1000;
        const now = new Date();
        const timeDiff = now.getTime() - lastSentTime.getTime();

        return timeDiff >= cooldownMs;
    }

    static getTimeUntilNextAttempt(lastSentTime: Date | null, cooldownMinutes: number = 3): number {
        if (!lastSentTime) return 0;

        const cooldownMs = cooldownMinutes * 60 * 1000;
        const now = new Date();
        const timeDiff = now.getTime() - lastSentTime.getTime();
        const remainingTime = cooldownMs - timeDiff;

        return Math.max(0, Math.ceil(remainingTime / 1000));
    }
} 