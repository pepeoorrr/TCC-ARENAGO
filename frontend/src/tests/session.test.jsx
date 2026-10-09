import React from 'react';
import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { usuariosAPI } from '../services/api';
vi.mock('../services/api', () => ({ usuariosAPI: { obterPerfil: vi.fn() } }));
function Status() { const { usuario, loading } = useAuth(); return <p>{loading ? 'Carregando sessão' : usuario?.perfil || 'Visitante'}</p>; }
it('restaura sessão pelo servidor, ignorando perfil desatualizado no storage', async () => {
  localStorage.setItem('token', 'token'); localStorage.setItem('usuario', JSON.stringify({ perfil: 'ADMIN' }));
  usuariosAPI.obterPerfil.mockResolvedValueOnce({ data: { id: 'u', perfil: 'CLIENTE' } });
  render(<AuthProvider><Status /></AuthProvider>);
  expect(await screen.findByText('CLIENTE')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('usuario')).perfil).toBe('CLIENTE');
});
it('sessão inválida encerra autenticação', async () => {
  localStorage.setItem('token', 'invalid'); usuariosAPI.obterPerfil.mockRejectedValueOnce(new Error('401'));
  render(<AuthProvider><Status /></AuthProvider>);
  expect(await screen.findByText('Visitante')).toBeInTheDocument(); expect(localStorage.getItem('token')).toBeNull();
});
