import mongoose from 'mongoose';

const imprentaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

export const Imprenta = mongoose.model('Imprenta', imprentaSchema);
