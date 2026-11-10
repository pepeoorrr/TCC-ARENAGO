import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
import Home from './pages/Home';
import ClientDashboard from './pages/ClientDashboard';
import Brand from './components/Brand';
import './App.css';
const managers = ['ADMIN', 'PROPRIETARIO'];
export function DashboardRedirect() {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="loading-spinner" /> Preparando seu espaço ArenaGo…</div>;
  return <Navigate replace to={!usuario ? '/login' : `/dashboard/${usuario.perfil === 'ADMIN' ? 'admin' : usuario.perfil === 'PROPRIETARIO' ? 'proprietario' : 'cliente'}`} />;
}
function SystemMessage({ title, description, to, action }) {
  return <main className="system-message"><Brand /><span className="page-eyebrow">ARENAGO</span><h1>{title}</h1><p>{description}</p><Link className="button button--sand" to={to}>{action} <span aria-hidden="true">→</span></Link></main>;
}
export function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<DashboardRedirect />} />
    <Route path="/nao-autorizado" element={<SystemMessage title="Acesso não permitido" description="Esta área é reservada a outro perfil. Volte ao seu painel para continuar usando a ArenaGo." to="/dashboard" action="Voltar ao painel" />} />
    <Route element={<PrivateRoute><Workspace /></PrivateRoute>}>
      <Route path="/dashboard/cliente" element={<PrivateRoute permissoes={['CLIENTE']}><ClientDashboard /></PrivateRoute>} />
      <Route path="/minhas-reservas" element={<PrivateRoute permissoes={['CLIENTE']}><ReservationList /></PrivateRoute>} />
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
    <Route path="*" element={<SystemMessage title="Não encontramos esta página" description="O endereço pode ter mudado ou não existir. Volte e continue buscando sua próxima quadra de areia." to="/" action="Ir para o início" />} />
  </Routes>;
}
export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL}><AuthProvider><ToastProvider><AppRoutes /></ToastProvider></AuthProvider></BrowserRouter>;
}
