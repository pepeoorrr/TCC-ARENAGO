import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Workspace from './components/Workspace';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';
import Management from './pages/Management';
import Booking from './pages/Booking';
import { ReservationList, ReservationDetail } from './pages/Reservations';
import { BillList, BillDetail } from './pages/Bills';
import ManagerDashboard from './pages/ManagerDashboard';
import Blocks from './pages/Blocks';
import './App.css';
const managers = ['ADMIN', 'PROPRIETARIO'];
export function DashboardRedirect() {
  const { usuario, loading } = useAuth();
  if (loading) return <p>Carregando...</p>;
  return <Navigate replace to={!usuario ? '/login' : `/dashboard/${usuario.perfil === 'ADMIN' ? 'admin' : usuario.perfil === 'PROPRIETARIO' ? 'proprietario' : 'cliente'}`} />;
}
export function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/" element={<DashboardRedirect />} />
    <Route path="/dashboard" element={<DashboardRedirect />} />
    <Route path="/nao-autorizado" element={<p className="p-8">Você não tem permissão para acessar esta página. <a href="/dashboard">Voltar</a></p>} />
    <Route element={<PrivateRoute><Workspace /></PrivateRoute>}>
      <Route path="/dashboard/cliente" element={<PrivateRoute permissoes={['CLIENTE']}><ReservationList /></PrivateRoute>} />
      <Route path="/dashboard/admin" element={<PrivateRoute permissoes={['ADMIN']}><ManagerDashboard /></PrivateRoute>} />
      <Route path="/dashboard/proprietario" element={<PrivateRoute permissoes={managers}><ManagerDashboard /></PrivateRoute>} />
      <Route path="/dashboard/funcionario" element={<Navigate to="/dashboard" replace />} />
      <Route path="/nova-reserva" element={<Booking />} />
      <Route path="/reserva/:id" element={<ReservationDetail />} />
      <Route path="/comandas" element={<BillList />} />
      <Route path="/comanda/:id" element={<BillDetail />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/agenda" element={<PrivateRoute permissoes={managers}><ReservationList /></PrivateRoute>} />
      <Route path="/bloqueios" element={<PrivateRoute permissoes={managers}><Blocks /></PrivateRoute>} />
      <Route path="/gerenciamento/:recurso" element={<PrivateRoute permissoes={managers}><Management /></PrivateRoute>} />
    </Route>
    <Route path="*" element={<p className="p-8">Página não encontrada. <a href="/dashboard">Voltar</a></p>} />
  </Routes>;
}
export default function App() {
  return <BrowserRouter><AuthProvider><ToastProvider><AppRoutes /></ToastProvider></AuthProvider></BrowserRouter>;
}
