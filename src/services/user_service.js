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

  async delete(username) {
    return await User.findOneAndDelete({ username });
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
  },

  async seedInitialAdmin() {
    const adminUser = await User.findOne({ username: 'admin_test' });
    if (!adminUser) {
      console.log('🌱 Sembrando usuario administrador por defecto...');
      await this.add({
        username: 'admin_test',
        password: 'password123',
        role: 'admin'
      });
      console.log('✅ Administrador "admin_test" creado correctamente.');
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Rol de "admin_test" actualizado a "admin".');
    }
  }
};
