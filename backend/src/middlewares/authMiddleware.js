const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Rotas públicas
  const rotasPublicas = ['/auth/registro', '/auth/login', '/auth/recuperar-senha', '/health'];
  
  if (rotasPublicas.includes(req.path)) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key');
    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

module.exports = authMiddleware;
