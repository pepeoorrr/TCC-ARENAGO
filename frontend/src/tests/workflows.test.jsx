import React from 'react';
import { beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Management from '../pages/Management';
import { BillDetail, BillList } from '../pages/Bills';
import Booking from '../pages/Booking';
import Workspace from '../components/Workspace';
import { produtosAPI, categoriasAPI, comandasAPI, estabelecimentosAPI, quadrasAPI, reservasAPI } from '../services/api';
const state = vi.hoisted(() => ({ perfil: 'PROPRIETARIO', localId: 'l1' }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ usuario: { id: 'u', nome: 'Pessoa', perfil: state.perfil }, logout: vi.fn() }) }));
vi.mock('../components/Workspace', async original => ({ ...(await original()), useLocal: () => ({ localId: state.localId, params: state.localId ? { estabelecimentoId: state.localId } : {}, reload: vi.fn(), locais: [{ id: 'l1', nome: 'Arena A', ativo: true }, { id: 'l2', nome: 'Arena B', ativo: true }] }) }));
vi.mock('../services/api', () => ({
  produtosAPI: { listar: vi.fn(), criar: vi.fn(), atualizar: vi.fn() }, categoriasAPI: { listar: vi.fn() },
  estabelecimentosAPI: { listar: vi.fn() }, usuariosAPI: {}, quadrasAPI: { listar: vi.fn() }, reservasAPI: { criar: vi.fn() }, disponibilidadeAPI: { obter: vi.fn() },
  comandasAPI: { listar: vi.fn(), obter: vi.fn(), adicionarItem: vi.fn() }
}));
const bill = { id: 'c', usuario: { nome: 'Cliente' }, usuarioId: 'c1', reserva: { usuarioId: 'c1', quadra: { nome: 'Quadra A', estabelecimentoId: 'l1' }, dataReserva: '2030-01-01' }, valorAluguel: '90', subtotalConsumos: '0', total: '90', status: 'ABERTA', itens: [] };
beforeEach(() => {
  state.perfil = 'PROPRIETARIO'; state.localId = 'l1';
  produtosAPI.listar.mockResolvedValue({ data: [{ id: 'p1', nome: 'Água', preco: 4, estoqueAtual: 5, ativo: true }] });
  categoriasAPI.listar.mockResolvedValue({ data: [{ id: 'cat1', nome: 'Bebidas', estabelecimentoId: 'l1', ativa: true }] });
  produtosAPI.criar.mockResolvedValue({ data: {} });
  comandasAPI.obter.mockResolvedValue({ data: bill }); comandasAPI.listar.mockResolvedValue({ data: [bill] });
  estabelecimentosAPI.listar.mockResolvedValue({ data: [{ id: 'l1', nome: 'Arena A', ativo: true }, { id: 'l2', nome: 'Arena B', ativo: true }] });
  quadrasAPI.listar.mockResolvedValue({ data: [{ id: 'q1', nome: 'Quadra A', precoHora: 90, ativa: true, durationPadraoMinutos: 60 }] });
});
const management = () => <MemoryRouter initialEntries={['/gerenciamento/produtos']}><Routes><Route path="/gerenciamento/:recurso" element={<Management />} /></Routes></MemoryRouter>;
it('gestão recarrega os dados quando muda o estabelecimento', async () => {
  const view = render(management()); await screen.findByText('Água');
  expect(produtosAPI.listar).toHaveBeenCalledWith({ estabelecimentoId: 'l1' });
  state.localId = 'l2'; view.rerender(management());
  await waitFor(() => expect(produtosAPI.listar).toHaveBeenLastCalledWith({ estabelecimentoId: 'l2' }));
});
it('formulário cadastra produto no local selecionado e confirma sucesso', async () => {
  const user = userEvent.setup(); render(management());
  await user.click(await screen.findByRole('button', { name: 'Novo cadastro' }));
  await user.type(screen.getByLabelText('Nome'), 'Suco');
  await user.selectOptions(screen.getByLabelText('Categoria'), 'cat1');
  await user.type(screen.getByLabelText('Preço'), '7.50');
  await user.click(screen.getByRole('button', { name: 'Salvar' }));
  await screen.findByRole('status');
  expect(produtosAPI.criar).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Suco', preco: 7.5, estabelecimentoId: 'l1', categoriaId: 'cat1' }));
});
it('erro de gravação permanece visível e mantém formulário', async () => {
  produtosAPI.criar.mockRejectedValueOnce({ response: { data: { erro: 'Categoria inválida' } } });
  const user = userEvent.setup(); render(management()); await user.click(await screen.findByText('Novo cadastro'));
  await user.type(screen.getByLabelText('Nome'), 'Suco'); await user.selectOptions(screen.getByLabelText('Categoria'), 'cat1'); await user.type(screen.getByLabelText('Preço'), '5');
  await user.click(screen.getByText('Salvar'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Categoria inválida'); expect(screen.getByLabelText('Nome')).toHaveValue('Suco');
});
it('cliente consulta a comanda sem controles operacionais ou consulta de estoque', async () => {
  state.perfil = 'CLIENTE';
  render(<MemoryRouter initialEntries={['/comanda/c']}><Routes><Route path="/comanda/:id" element={<BillDetail />} /></Routes></MemoryRouter>);
  await screen.findByText('Comanda de Cliente');
  expect(screen.queryByText('Lançar consumo')).not.toBeInTheDocument(); expect(screen.queryByText('Fechar comanda')).not.toBeInTheDocument();
  expect(produtosAPI.listar).not.toHaveBeenCalled();
});
it('lista de comandas do cliente mostra dados recebidos da API', async () => {
  state.perfil = 'CLIENTE'; render(<MemoryRouter><BillList /></MemoryRouter>);
  expect(screen.getByText('Carregando...')).toBeInTheDocument();
  expect(await screen.findByRole('link')).toHaveAttribute('href', '/comanda/c'); expect(screen.getByText('Minhas comandas')).toBeInTheDocument();
});
it('nova reserva exige selecionar local e limpa quadra na troca', async () => {
  state.perfil = 'CLIENTE'; const user = userEvent.setup(); render(<MemoryRouter><Booking /></MemoryRouter>);
  expect(screen.getByLabelText('Quadra')).toBeDisabled();
  await user.selectOptions(screen.getByLabelText('Local da reserva'), 'l1');
  await waitFor(() => expect(quadrasAPI.listar).toHaveBeenCalledWith({ estabelecimentoId: 'l1' }));
  await user.selectOptions(screen.getByLabelText('Quadra'), 'q1');
  await user.selectOptions(screen.getByLabelText('Local da reserva'), 'l2');
  await waitFor(() => expect(screen.getByLabelText('Quadra')).toHaveValue(''));
  expect(reservasAPI.criar).not.toHaveBeenCalled();
});
it('menu do proprietário não oferece administração de usuários', async () => {
  render(<MemoryRouter><Workspace /></MemoryRouter>);
  await screen.findByRole('option', { name: 'Arena A' });
  expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Produtos e estoque' })).toBeInTheDocument();
});
