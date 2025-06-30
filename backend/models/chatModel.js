import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const chatSchema = new Schema(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true }],
    latestMessage: { type: Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

// Optional: indexing for faster queries
chatSchema.index({ participants: 1 });

export default model('Chat', chatSchema);
