import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import { publicAPI } from '../services/api';

const session = vi.hoisted(() => ({ authenticated: false }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ estaAutenticado: () => session.authenticated }) }));
vi.mock('../services/api', () => ({ publicAPI: { buscarQuadras: vi.fn() } }));

const result = [{ id: 'venue-1', nome: 'Arena Praia', endereco: 'Santos, SP', quadras: [{ id: 'court-1', nome: 'Quadra 1', tipo: 'BEACH_TENNIS', descricao: null, precoHora: '80.00', horarioInicio: '06:00', horarioFim: '22:00', durationPadraoMinutos: 60 }] }];
beforeEach(() => {
  session.authenticated = false;
  publicAPI.buscarQuadras.mockReset().mockResolvedValue({ data: result });
});

it('mostra busca de quadras reais e CTA de criar conta', () => {
  render(<MemoryRouter><Home /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: /sua quadra\./i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /criar conta/i })[0]).toHaveAttribute('href', '/cadastro');
  expect(screen.getByRole('button', { name: 'Buscar quadras' })).toBeInTheDocument();
});

it('busca arenas por cidade, esporte, data, hora e preço e oferece pré-reserva', async () => {
  const user = userEvent.setup(); render(<MemoryRouter><Home /></MemoryRouter>);
  await user.type(screen.getByRole('textbox', { name: 'Cidade, arena ou quadra' }), 'Santos');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Esporte' }), 'BEACH_TENNIS');
  await user.type(screen.getByLabelText('Data do jogo'), '2030-01-02');
  await user.type(screen.getByLabelText('Horário inicial'), '18:00');
  await user.type(screen.getByRole('spinbutton', { name: 'Preço máximo por hora' }), '100');
  await user.click(screen.getByRole('button', { name: 'Buscar quadras' }));
  await screen.findByRole('heading', { name: 'Arena Praia' });
  expect(publicAPI.buscarQuadras).toHaveBeenCalledWith({ q: 'Santos', tipo: 'BEACH_TENNIS', data: '2030-01-02', hora: '18:00', precoMax: '100' });
  expect(screen.getByText('R$ 80,00')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /escolher horário/i })).toHaveAttribute('href', '/cadastro');
});

it('mostra duas quadras Beach Tennis separadas e associa a foto de cada uma', async () => {
  publicAPI.buscarQuadras.mockResolvedValueOnce({ data: [{
    id: 'kona', nome: 'Arena Kona', endereco: 'Santos, SP', quadras: [
      { ...result[0].quadras[0], id: 'kona-1', nome: 'Quadra 1' },
      { ...result[0].quadras[0], id: 'kona-2', nome: 'Quadra 2' }
    ]
  }] });
  const user = userEvent.setup(); render(<MemoryRouter><Home /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: 'Buscar quadras' }));
  expect(await screen.findByRole('heading', { name: 'Arena Kona' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Quadra 1' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Quadra 2' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Vista da Quadra 1 na Arena Kona' })).toHaveAttribute('src', '/images/quadra-beach-1.jpg');
  expect(screen.getByRole('img', { name: 'Vista da Quadra 2 na Arena Kona' })).toHaveAttribute('src', '/images/quadra-beach-2.jpg');
  expect(screen.getAllByRole('link', { name: /escolher horário/i })).toHaveLength(2);
});

it('exibe estado vazio e permite limpar os filtros', async () => {
  publicAPI.buscarQuadras.mockResolvedValueOnce({ data: [] });
  const user = userEvent.setup(); render(<MemoryRouter><Home /></MemoryRouter>);
  await user.type(screen.getByRole('textbox', { name: 'Cidade, arena ou quadra' }), 'Lugar sem quadras');
  await user.click(screen.getByRole('button', { name: 'Buscar quadras' }));
  expect(await screen.findByRole('heading', { name: 'Nenhuma quadra encontrada' })).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Cidade, arena ou quadra' })).toHaveValue(''));
});

it('exige uma data antes de filtrar disponibilidade por horário', async () => {
  const user = userEvent.setup(); render(<MemoryRouter><Home /></MemoryRouter>);
  await user.type(screen.getByLabelText('Horário inicial'), '18:00');
  await user.click(screen.getByRole('button', { name: 'Buscar quadras' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma data');
  expect(publicAPI.buscarQuadras).not.toHaveBeenCalled();
});
