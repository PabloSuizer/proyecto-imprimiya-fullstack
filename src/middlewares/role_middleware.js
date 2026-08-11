import { User } from '../mongo-db/user_mongo.js';

export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.session) {
      return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión.' });
    }

    const user = await User.findOne({ username: req.session.username });
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Acceso prohibido. Permisos insuficientes.' });
    }

    next();
  };
};
