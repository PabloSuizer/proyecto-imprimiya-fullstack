import { Imprenta } from '../mongo-db/imprenta_mongo.js';

export const ImprentaService = {
  async getAll() {
    return await Imprenta.find();
  },

  async getById(id) {
    return await Imprenta.findById(id);
  },

  async add(data) {
    const newImprenta = new Imprenta(data);
    return await newImprenta.save();
  },

  async update(id, data) {
    return await Imprenta.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id) {
    return await Imprenta.findByIdAndDelete(id);
  }
};
