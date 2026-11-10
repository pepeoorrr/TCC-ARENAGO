import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Perfil from '../pages/Perfil';
import { usuariosAPI } from '../services/api';

const session = vi.hoisted(() => ({ atualizarUsuario: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ atualizarUsuario: session.atualizarUsuario }) }));
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('../services/api', () => ({ usuariosAPI: { obterPerfil: vi.fn(), atualizarPerfil: vi.fn(), alterarSenha: vi.fn() } }));

beforeEach(() => {
  usuariosAPI.obterPerfil.mockResolvedValue({ data: { nome: 'Joana Silva', email: 'joana@example.com', telefone: '11999999999', cpf: '12345678901' } });
  usuariosAPI.alterarSenha.mockResolvedValue({ data: { mensagem: 'Senha alterada com sucesso' } });
});

it('envia a troca de senha pelo formulário do perfil e confirma o sucesso', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Perfil /></MemoryRouter>);
  await screen.findByDisplayValue('Joana Silva');
  await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
  await user.type(screen.getByLabelText(/Senha atual/), 'senha-antiga');
  await user.type(screen.getByLabelText(/Nova senha/), 'senha-nova');
  await user.type(screen.getByLabelText(/Confirmar nova senha/), 'senha-nova');
  await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
  await waitFor(() => expect(usuariosAPI.alterarSenha).toHaveBeenCalledWith({ senhaAtual: 'senha-antiga', novaSenha: 'senha-nova', confirmarSenha: 'senha-nova' }));
  expect(await screen.findByText('Senha alterada com sucesso')).toBeInTheDocument();
});
