import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children, permissoes }) => {
  const { estaAutenticado, temPermissao, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  if (permissoes && !temPermissao(permissoes)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children;
};
