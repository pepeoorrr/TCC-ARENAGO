import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { DashboardRedirect } from '../App';
const state = vi.hoisted(() => ({ perfil: 'CLIENTE', authenticated: true, loading: false }));
vi.mock('../context/AuthContext', () => ({ AuthProvider: ({ children }) => children, useAuth: () => ({ usuario: state.authenticated ? { perfil: state.perfil } : null, loading: state.loading, estaAutenticado: () => state.authenticated, temPermissao: roles => roles.includes(state.perfil) }) }));
beforeEach(() => { state.perfil = 'CLIENTE'; state.authenticated = true; state.loading = false; });
describe('controle de acesso e navegação', () => {
  it.each([['ADMIN', 'admin'], ['PROPRIETARIO', 'proprietario'], ['CLIENTE', 'cliente']])('redireciona %s para seu painel', (perfil, path) => {
    state.perfil = perfil;
    render(<MemoryRouter><Routes><Route path="/" element={<DashboardRedirect />} /><Route path={`/dashboard/${path}`} element={<p>Painel correto</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText('Painel correto')).toBeInTheDocument();
  });
  it('impede cliente de acessar gestão', () => {
    render(<MemoryRouter><Routes><Route path="/" element={<PrivateRoute permissoes={['ADMIN', 'PROPRIETARIO']}><p>Privado</p></PrivateRoute>} /><Route path="/nao-autorizado" element={<p>Acesso negado</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText('Acesso negado')).toBeInTheDocument(); expect(screen.queryByText('Privado')).not.toBeInTheDocument();
  });
  it('solicita login para visitante', () => {
    state.authenticated = false;
    render(<MemoryRouter><Routes><Route path="/" element={<PrivateRoute><p>Privado</p></PrivateRoute>} /><Route path="/login" element={<p>Entrar</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });
  it('aguarda atualização da sessão antes de decidir acesso', () => {
    state.loading = true;
    render(<MemoryRouter><PrivateRoute><p>Privado</p></PrivateRoute></MemoryRouter>);
    expect(screen.getByText('Carregando...')).toBeInTheDocument(); expect(screen.queryByText('Privado')).not.toBeInTheDocument();
  });
});
