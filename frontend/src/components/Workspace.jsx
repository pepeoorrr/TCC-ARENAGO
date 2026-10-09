import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { estabelecimentosAPI } from '../services/api';
const LocalContext = createContext();
export const useLocal = () => useContext(LocalContext);
export const currency = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const day = value => value?.slice(0, 10).split('-').reverse().join('/');
export const errorMessage = error => error.response?.data?.erro || 'Não foi possível concluir a operação.';

export default function Workspace() {
  const { usuario, logout } = useAuth();
  const [locais, setLocais] = useState([]), [localId, setLocalId] = useState(''), [error, setError] = useState('');
  const reload = async () => {
    try {
      const { data } = await estabelecimentosAPI.listar(); setLocais(data); setError('');
      setLocalId(current => data.some(l => l.id === current) ? current : '');
    } catch (e) { setError(errorMessage(e)); }
  };
  useEffect(() => { reload(); }, [usuario.id]);
  const manager = usuario.perfil !== 'CLIENTE';
  return <LocalContext.Provider value={{ locais, localId, setLocalId, reload, params: localId ? { estabelecimentoId: localId } : {} }}>
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white p-5"><div className="max-w-7xl mx-auto flex flex-wrap gap-5 items-center justify-between">
        <Link className="text-2xl font-bold" to="/dashboard">ArenaGo</Link>
        <span>{usuario.nome} · {usuario.perfil === 'PROPRIETARIO' ? 'Proprietário' : usuario.perfil === 'ADMIN' ? 'Admin' : 'Cliente'}</span>
        <nav className="flex gap-4 flex-wrap"><Link to="/dashboard">Painel</Link><Link to="/nova-reserva">Nova reserva</Link>
          <Link to="/comandas">{manager ? 'Comandas' : 'Minhas comandas'}</Link><Link to="/perfil">Perfil</Link>
          <button onClick={logout}>Sair</button></nav>
      </div></header>
      <main className="max-w-7xl mx-auto p-5 space-y-6">
        {manager && <><nav className="flex flex-wrap gap-4 font-medium">
          {['estabelecimentos', 'quadras', 'categorias', 'produtos'].map(item => <Link key={item} to={`/gerenciamento/${item}`}>{({ estabelecimentos: 'Estabelecimentos', quadras: 'Quadras', categorias: 'Categorias', produtos: 'Produtos e estoque' })[item]}</Link>)}
          <Link to="/agenda">Agenda</Link><Link to="/bloqueios">Bloqueios</Link>
          {usuario.perfil === 'ADMIN' && <Link to="/gerenciamento/usuarios">Usuários</Link>}
        </nav><label className="block">Estabelecimento
          <select className="block border rounded p-2 bg-white mt-1 w-full max-w-md" value={localId} onChange={e => setLocalId(e.target.value)}>
            <option value="">{usuario.perfil === 'ADMIN' ? 'Todos os estabelecimentos' : 'Todos os meus estabelecimentos'}</option>
            {locais.map(l => <option key={l.id} value={l.id}>{l.nome}{!l.ativo ? ' (inativo)' : ''}</option>)}
          </select></label></>}
        {error && <p role="alert" className="text-red-700">{error} <button onClick={reload}>Tentar novamente</button></p>}
        <Outlet />
      </main>
    </div>
  </LocalContext.Provider>;
}
