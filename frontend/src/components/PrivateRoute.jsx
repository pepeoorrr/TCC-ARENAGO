import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, permissoes }) => {
  const { estaAutenticado, temPermissao, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading"><span className="loading-spinner" /> Carregando sua conta ArenaGo…</div>
    );
  }

  if (!estaAutenticado()) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, state: location.state } }} />;
  }

  if (permissoes && !temPermissao(permissoes)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children;
};

export default PrivateRoute;
