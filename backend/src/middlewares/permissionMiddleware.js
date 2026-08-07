const permissionMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    const { perfil } = req.usuario;

    if (!rolesPermitidos.includes(perfil)) {
      return res.status(403).json({
        erro: 'Acesso proibido. Você não tem permissão para acessar este recurso.'
      });
    }

    next();
  };
};

module.exports = permissionMiddleware;
