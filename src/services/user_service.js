import { User } from '../mongo-db/user_mongo.js';
import bcrypt from 'bcrypt';

export const UserService = {
  async getByUsername(username) {
    return await User.findOne({ username });
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
