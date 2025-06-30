import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const messageSchema = new Schema(
  {
    chat: { type: Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Optional: keep latestMessage in sync
messageSchema.post('save', async function (doc, next) {
  await doc.model('Chat').findByIdAndUpdate(doc.chat, { latestMessage: doc._id });
  next();
});

export default model('Message', messageSchema);
