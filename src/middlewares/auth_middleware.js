import { Session } from '../mongo-db/session_mongo.js';

export const checkAuthorizationToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return next(); // Continúa sin sesión (los endpoints protegidos fallarán después)
  }

  const token = authHeader.split(' ')[1];
  try {
    const session = await Session.findOne({ token });
    if (session) {
      req.session = session; // Inyección de la sesión activa en el request
    }
    next();
  } catch (error) {
    next(error);
  }
};
