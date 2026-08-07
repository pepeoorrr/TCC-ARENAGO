const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Erro de validação',
      detalhes: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      erro: 'Não autorizado'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      erro: 'Acesso proibido'
    });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({
      erro: 'Dados duplicados',
      campo: err.meta?.target?.[0]
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      erro: 'Registro não encontrado'
    });
  }

  return res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
