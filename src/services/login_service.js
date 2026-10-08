import { UserService } from './user_service.js';
import { Session } from '../mongo-db/session_mongo.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const LoginService = {
  async login(username, password) {
    const user = await UserService.getByUsername(username);
    if (!user) throw new Error('Usuario no encontrado');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Contraseña incorrecta');

    // Generar un token con seguridad criptográfica
    const token = crypto.randomBytes(32).toString('hex');

    const session = new Session({
      token,
      username: user.username,
      role: user.role
    });

    return await session.save();
  }
};
