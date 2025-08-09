import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for SmsHistory document
export interface ISmsHistory extends Document {
  phone: string;
  message: string;
  type: 'ai' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for SmsHistory static methods
export interface ISmsHistoryModel extends Model<ISmsHistory> {
  getRecentMessages(phone: string, limit?: number): Promise<ISmsHistory[]>;
  saveMessage(phone: string, message: string, type: 'ai' | 'user'): Promise<ISmsHistory>;
  getConversationContext(phone: string, limit?: number): Promise<string>;
}

// Define the SmsHistory schema
const SmsHistorySchema: Schema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true, // Index for faster queries by phone number
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000, // Reasonable limit for SMS messages
    },
    type: {
      type: String,
      enum: ['ai', 'user'],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create compound index for efficient querying of recent messages by phone
SmsHistorySchema.index({ phone: 1, createdAt: -1 });

// Static method to get recent messages for a phone number
SmsHistorySchema.statics.getRecentMessages = async function(
  phone: string,
  limit: number = 5
): Promise<ISmsHistory[]> {
  return this.find({ phone })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('phone message type createdAt')
    .lean();
};

// Static method to save a new message
SmsHistorySchema.statics.saveMessage = async function(
  phone: string,
  message: string,
  type: 'ai' | 'user'
): Promise<ISmsHistory> {
  const smsHistory = new this({
    phone,
    message,
    type,
  });
  return smsHistory.save();
};

// Static method to get conversation context for AI
SmsHistorySchema.statics.getConversationContext = async function(
  phone: string,
  limit: number = 5
): Promise<string> {
  const messages = await (this as any).getRecentMessages(phone, limit);
  
  // Reverse to get chronological order (oldest first)
  const chronologicalMessages = messages.reverse();
  
  if (chronologicalMessages.length === 0) {
    return '';
  }
  
  // Format messages for AI context
  const context = chronologicalMessages
    .map((msg: any) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.message}`)
    .join('\n');
    
  return `Previous conversation:\n${context}\n\n`;
};

// Create and export the model
export const SmsHistory = mongoose.model<ISmsHistory, ISmsHistoryModel>('SmsHistory', SmsHistorySchema);

// Export default
export default SmsHistory;