import { User } from '../mongo-db/user_mongo.js';
import bcrypt from 'bcrypt';

export const UserService = {
  async getAll() {
    return await User.find({}, { password: 0 }); // Excluir la contraseña por seguridad
  },

  async getByUsername(username) {
    return await User.findOne({ username });
  },

  async updateRole(username, newRole) {
    return await User.findOneAndUpdate({ username }, { role: newRole }, { new: true });
  },

  async add(userData) {
    // Cifrar la contraseña antes de guardar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });
    return await newUser.save();
  }
};
