import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);
