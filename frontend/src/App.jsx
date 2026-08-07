import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import DashboardCliente from './pages/DashboardCliente';
import DashboardAdmin from './pages/DashboardAdmin';
import NovaReserva from './pages/NovaReserva';
import Perfil from './pages/Perfil';
import './App.css';

// Placeholder pages (será criadas posteriormente)
const DashboardFuncionario = () => <div className="p-8"><h1>Dashboard Funcionário - Em desenvolvimento</h1></div>;
const NaoAutorizado = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
      <p className="text-gray-600 mb-4">Você não tem permissão para acessar este recurso</p>
      <a href="/dashboard" className="text-blue-600 hover:text-blue-800">Voltar ao Dashboard</a>
    </div>
  </div>
);
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Página não encontrada</p>
      <a href="/" className="text-blue-600 hover:text-blue-800">Ir para Home</a>
    </div>
  </div>
);

// Componente para redirecionar para o dashboard correto baseado no perfil
const RedireccionarDashboard = () => {
  const { usuario, estaAutenticado } = useAuth();

  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  const perfil = usuario?.perfil;

  switch (perfil) {
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" replace />;
    case 'FUNCIONARIO':
      return <Navigate to="/dashboard/funcionario" replace />;
    case 'CLIENTE':
    default:
      return <Navigate to="/dashboard/cliente" replace />;
  }
};

// Rota Home
const Home = () => {
  const { estaAutenticado } = useAuth();

  if (estaAutenticado()) {
    return <RedireccionarDashboard />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/nao-autorizado" element={<NaoAutorizado />} />

          {/* Rotas Privadas - Dashboards */}
          <Route
            path="/dashboard"
            element={<RedireccionarDashboard />}
          />
          <Route
            path="/dashboard/cliente"
            element={
              <PrivateRoute permissoes={['CLIENTE']}>
                <DashboardCliente />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute permissoes={['ADMIN']}>
                <DashboardAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/funcionario"
            element={
              <PrivateRoute permissoes={['FUNCIONARIO', 'ADMIN']}>
                <DashboardFuncionario />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Reservas (será desenvolvidas) */}
          <Route
            path="/nova-reserva"
            element={
              <PrivateRoute permissoes={['CLIENTE']}>
                <NovaReserva />
              </PrivateRoute>
            }
          />
          <Route
            path="/reserva/:id"
            element={
              <PrivateRoute permissoes={['CLIENTE']}>
                <div className="p-8"><h1>Detalhes Reserva - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Perfil (será desenvolvidas) */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Gerenciamento (será desenvolvidas) */}
          <Route
            path="/gerenciamento/quadras"
            element={
              <PrivateRoute permissoes={['ADMIN']}>
                <div className="p-8"><h1>Gerenciamento de Quadras - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/gerenciamento/produtos"
            element={
              <PrivateRoute permissoes={['ADMIN']}>
                <div className="p-8"><h1>Gerenciamento de Produtos - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/gerenciamento/usuarios"
            element={
              <PrivateRoute permissoes={['ADMIN']}>
                <div className="p-8"><h1>Gerenciamento de Usuários - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Agenda Funcionário (será desenvolvidas) */}
          <Route
            path="/agenda"
            element={
              <PrivateRoute permissoes={['FUNCIONARIO', 'ADMIN']}>
                <div className="p-8"><h1>Agenda do Dia - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/comanda/:id"
            element={
              <PrivateRoute permissoes={['FUNCIONARIO', 'ADMIN']}>
                <div className="p-8"><h1>Detalhes Comanda - Em desenvolvimento</h1></div>
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
