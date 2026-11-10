import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

const session = vi.hoisted(() => ({ authenticated: false }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ estaAutenticado: () => session.authenticated }) }));

beforeEach(() => { session.authenticated = false; });

it('exibe a página inicial e links para explorar e criar conta', () => {
  render(<MemoryRouter><Home /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /a areia está chamando/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /^Criar conta$/i })[0]).toHaveAttribute('href', '/cadastro');
  expect(screen.getAllByRole('link', { name: /criar conta para reservar/i })).toHaveLength(2);
});

it('filtra a prévia de arenas pela cidade digitada', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Home /></MemoryRouter>);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Modalidade esportiva' }), 'Todas as modalidades');
  await user.type(screen.getByRole('textbox', { name: 'Cidade ou região' }), 'Santos');
  await user.click(screen.getByRole('button', { name: 'Buscar arenas' }));
  expect(screen.getByRole('heading', { name: 'Arena Brisa' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Arena Maré Alta' })).not.toBeInTheDocument();
});

it('mostra mensagem clara quando o filtro não encontra exemplos', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Home /></MemoryRouter>);
  await user.type(screen.getByRole('textbox', { name: 'Cidade ou região' }), 'Cidade inexistente');
  await user.click(screen.getByRole('button', { name: 'Buscar arenas' }));
  expect(screen.getByRole('heading', { name: 'Nenhuma arena nesta prévia' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
  expect(screen.getByRole('heading', { name: 'Arena Maré Alta' })).toBeInTheDocument();
});
