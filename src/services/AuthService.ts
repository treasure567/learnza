import User from '@models/User';
import { HashUtils } from '@utils/HashUtils';
import { JwtUtils } from '@utils/JwtUtils';
import { RateLimitUtils } from '@utils/RateLimitUtils';
import { IUser, UserResponse } from '@/types/user';
import { CustomError } from '@middleware/errorHandler';
import crypto from 'crypto';
import { UserUtils } from '@/utils/UserUtils';
import { GameUtil } from '@/utils/GameUtil';
import { Types } from 'mongoose';
import { MicroserviceUtils, MicroService } from '@/utils/MicroserviceUtils';

export class AuthService {
    // Email templates
    private static buildEmailTemplate(title: string, contentHtml: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { background:#f6f8fb; margin:0; padding:0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif; color:#0f172a; }
    .container { width:100%; padding:32px 0; }
    .wrapper { max-width:560px; margin:0 auto; padding:0 16px; }
    .card { background:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(15,23,42,0.06); overflow:hidden; }
    .header { padding:20px 24px; background:linear-gradient(135deg, #111827 0%, #0f766e 100%); color:#ffffff; }
    .header h1 { margin:0; font-size:18px; font-weight:600; letter-spacing:0.2px; }
    .content { padding:24px; }
    .content p { margin:0 0 12px; line-height:1.6; color:#0f172a; }
    .code { display:inline-block; background:#0f172a; color:#ffffff; padding:12px 16px; border-radius:10px; font-size:24px; letter-spacing:6px; font-weight:700; margin:8px 0 4px; }
    .muted { color:#64748b; font-size:13px; }
    .btn { display:inline-block; background:#0f766e; color:#ffffff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; margin:12px 0; }
    .footer { text-align:center; color:#64748b; font-size:12px; padding:16px; }
    @media (prefers-color-scheme: dark) {
      body { background:#0b1220; color:#e2e8f0; }
      .card { background:#0f172a; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
      .content p { color:#e2e8f0; }
      .muted { color:#94a3b8; }
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
        </div>
        <div class="footer">
          You are receiving this email because you have an account with Learnza.
        </div>
      </div>
    </div>
  </body>
</html>`;
    }

    private static buildVerificationEmail(name: string, code: string): string {
        const content = `
          <p>Hi ${name},</p>
          <p>Use the verification code below to verify your email address:</p>
          <div class="code">${code}</div>
          <p class="muted">This code will expire in 10 minutes. If you didn’t request this, you can safely ignore this email.</p>
        `;
        return this.buildEmailTemplate('Verify your Learnza email', content);
    }

    private static buildResetEmail(name: string, resetUrl: string): string {
        const content = `
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <p><a class="btn" href="${resetUrl}" target="_blank" rel="noopener">Reset password</a></p>
          <p class="muted">If the button doesn’t work, copy and paste this link into your browser:</p>
          <p class="muted">${resetUrl}</p>
          <p class="muted">If you didn’t request a password reset, you can safely ignore this message.</p>
        `;
        return this.buildEmailTemplate('Reset your Learnza password', content);
    }

    private static generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private static generateResetToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    static async register(email: string, name: string, password: string): Promise<UserResponse> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new CustomError('Email already registered', 400);
        }

        const hashedPassword = await HashUtils.hash(password);
        const verificationCode = this.generateVerificationCode();
        const hashedVerificationCode = await HashUtils.hashVerificationCode(verificationCode);
        
        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            verificationCode: hashedVerificationCode,
            level: 1,
            totalPoints: 0,
            loginStreak: 1,
            lastLogin: new Date()
        });

        try {
            const html = this.buildVerificationEmail(name, verificationCode);
            await MicroserviceUtils.post(
                MicroService.NOTIFICATION,
                '/api/notifications/email',
                { to: email, subject: 'Verify your Learnza email', html }
            );
        } catch (err) {
            // Fallback to log if microservice is not configured or down
            console.log(`Verification code ${verificationCode} would be sent to ${email}`);
        }

        const token = JwtUtils.generateToken({ userId: user._id as string });
        GameUtil.updateTaskProgress(user._id as Types.ObjectId, 'STREAK');
        return { user: await UserUtils.populateUser(user), token };
    }

    static async login(email: string, password: string): Promise<UserResponse> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('Invalid credentials', 401);
        }

        const isValidPassword = await HashUtils.compare(password, user.password);
        if (!isValidPassword) {
            throw new CustomError('Invalid credentials', 401);
        }

        const token = JwtUtils.generateToken({ userId: user._id as string });
        GameUtil.updateTaskProgress(user._id as Types.ObjectId, 'STREAK');
        return { user: await UserUtils.populateUser(user), token };
    }

    static async verifyEmail(userId: string, code: string): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (user.emailVerifiedAt) {
            throw new CustomError('Email already verified', 400);
        }

        if (!user.verificationCode) {
            throw new CustomError('No verification code found', 400);
        }

        const isValidCode = await HashUtils.compareVerificationCode(code, user.verificationCode);
        if (!isValidCode) {
            throw new CustomError('Invalid verification code', 400);
        }

        user.emailVerifiedAt = new Date();
        user.verificationCode = undefined;
        await user.save();

        return await UserUtils.populateUser(user);
    }

    static async resendVerificationCode(userId: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (user.emailVerifiedAt) {
            throw new CustomError('Email already verified', 400);
        }

        if (!RateLimitUtils.canResendOtp(user.lastSentOtp)) {
            const secondsRemaining = RateLimitUtils.getTimeUntilNextAttempt(user.lastSentOtp);
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            throw new CustomError(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before requesting a new code`, 429);
        }

        const verificationCode = this.generateVerificationCode();
        user.verificationCode = await HashUtils.hashVerificationCode(verificationCode);
        user.lastSentOtp = new Date();
        await user.save();

        try {
            const html = this.buildVerificationEmail(user.name, verificationCode);
            await MicroserviceUtils.post(
                MicroService.NOTIFICATION,
                '/api/notifications/email',
                { to: user.email, subject: 'Your new Learnza verification code', html }
            );
        } catch (err) {
            console.log(`New verification code ${verificationCode} would be sent to ${user.email}`);
        }
    }

    static async forgotPassword(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        if (!RateLimitUtils.canResendOtp(user.lastResetRequest, 5)) {
            const secondsRemaining = RateLimitUtils.getTimeUntilNextAttempt(user.lastResetRequest, 5);
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            throw new CustomError(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''} before requesting another password reset`, 429);
        }

        const resetToken = this.generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        user.lastResetRequest = new Date();
        await user.save();

        // Send reset password email via Notifications microservice (if configured)
        try {
            const resetUrl = `${process.env.APP_URL || 'https://learnza.net.ng'}/reset?token=${resetToken}`;
            const html = this.buildResetEmail(user.name, resetUrl);
            await MicroserviceUtils.post(
                MicroService.NOTIFICATION,
                '/api/notifications/email',
                { to: email, subject: 'Reset your Learnza password', html }
            );
        } catch (err) {
            console.log(`Reset password link with token ${resetToken} would be sent to ${email}`);
        }
    }

    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new CustomError('Invalid or expired reset token', 400);
        }

        user.password = await HashUtils.hash(newPassword);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
    }
} 