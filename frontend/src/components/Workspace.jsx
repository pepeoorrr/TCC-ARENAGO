import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { estabelecimentosAPI } from '../services/api';
import Brand from './Brand';
const LocalContext = createContext();
export const useLocal = () => useContext(LocalContext);
export const currency = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const day = value => value?.slice(0, 10).split('-').reverse().join('/');
export const errorMessage = error => error.response?.data?.erro || (error.request
  ? 'Não foi possível conectar à API. Verifique se o servidor está em execução e tente novamente.'
  : 'Não foi possível concluir a operação. Tente novamente.');

export default function Workspace() {
  const { usuario, logout } = useAuth();
  const location = useLocation(), navigate = useNavigate();
  const [locais, setLocais] = useState([]), [localId, setLocalId] = useState(''), [error, setError] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const reload = async () => {
    try {
      const { data } = await estabelecimentosAPI.listar(); setLocais(data); setError('');
      setLocalId(current => data.some(l => l.id === current) ? current : '');
    } catch (e) { setError(errorMessage(e)); }
  };
  useEffect(() => { reload(); }, [usuario.id]);
  const manager = usuario.perfil !== 'CLIENTE';
  const current = path => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const closeMenu = () => setMenuAberto(false);
  const sair = () => { logout(); navigate('/login', { replace: true }); };
  return <LocalContext.Provider value={{ locais, localId, setLocalId, reload, params: localId ? { estabelecimentoId: localId } : {} }}>
    <div className={`app-shell${menuAberto ? ' workspace--menu-open' : ''}`}>
      <header className="workspace-header"><div className="workspace-header__inner">
        <Brand className="workspace-brand" to="/dashboard" onClick={closeMenu} />
        <button className="workspace-menu-toggle" type="button" aria-label={menuAberto ? 'Fechar menu da conta' : 'Abrir menu da conta'} aria-expanded={menuAberto} onClick={() => setMenuAberto(!menuAberto)}><span /><span /><span /></button>
        <div className={`workspace-header__account${menuAberto ? ' is-open' : ''}`}>
          <div className="workspace-user"><span className="workspace-user__avatar" aria-hidden="true">{usuario.nome?.trim()?.[0]?.toUpperCase() || 'A'}</span><span><strong>{usuario.nome}</strong><small>{usuario.perfil === 'PROPRIETARIO' ? 'Proprietário' : usuario.perfil === 'ADMIN' ? 'Administrador' : 'Cliente'}</small></span></div>
          <button className="workspace-logout" type="button" onClick={sair}>Sair <span aria-hidden="true">↗</span></button>
        </div>
      </div></header>
      <div className="workspace-primary-nav"><nav className="workspace-primary-nav__inner" aria-label="Navegação da conta">
        <Link className={current('/dashboard') ? 'is-active' : ''} aria-current={current('/dashboard') ? 'page' : undefined} to="/dashboard" onClick={closeMenu}>Painel</Link>
        <Link className={current('/nova-reserva') ? 'is-active' : ''} aria-current={current('/nova-reserva') ? 'page' : undefined} to="/nova-reserva" onClick={closeMenu}>Nova reserva</Link>
        <Link className={current('/comandas') || current('/comanda') ? 'is-active' : ''} aria-current={current('/comandas') || current('/comanda') ? 'page' : undefined} to="/comandas" onClick={closeMenu}>{manager ? 'Comandas' : 'Minhas comandas'}</Link>
        <Link className={current('/perfil') ? 'is-active' : ''} aria-current={current('/perfil') ? 'page' : undefined} to="/perfil" onClick={closeMenu}>Meu perfil</Link>
      </nav></div>
      <main className="app-main">
        {manager && <div className="workspace-tools"><nav className="workspace-tools__nav" aria-label="Ferramentas de gestão">
          {['estabelecimentos', 'quadras', 'categorias', 'produtos'].map(item => <Link className={current(`/gerenciamento/${item}`) ? 'is-active' : ''} aria-current={current(`/gerenciamento/${item}`) ? 'page' : undefined} key={item} to={`/gerenciamento/${item}`} onClick={closeMenu}>{({ estabelecimentos: 'Estabelecimentos', quadras: 'Quadras', categorias: 'Categorias', produtos: 'Produtos e estoque' })[item]}</Link>)}
          <Link className={current('/agenda') ? 'is-active' : ''} aria-current={current('/agenda') ? 'page' : undefined} to="/agenda" onClick={closeMenu}>Agenda</Link><Link className={current('/bloqueios') ? 'is-active' : ''} aria-current={current('/bloqueios') ? 'page' : undefined} to="/bloqueios" onClick={closeMenu}>Bloqueios</Link>
          {usuario.perfil === 'ADMIN' && <Link className={current('/gerenciamento/usuarios') ? 'is-active' : ''} aria-current={current('/gerenciamento/usuarios') ? 'page' : undefined} to="/gerenciamento/usuarios" onClick={closeMenu}>Usuários</Link>}
        </nav><label className="workspace-location">Estabelecimento
          <select value={localId} onChange={e => setLocalId(e.target.value)}>
            <option value="">{usuario.perfil === 'ADMIN' ? 'Todos os estabelecimentos' : 'Todos os meus estabelecimentos'}</option>
            {locais.map(l => <option key={l.id} value={l.id}>{l.nome}{!l.ativo ? ' (inativo)' : ''}</option>)}
          </select></label></div>}
        {error && <p role="alert" className="workspace-error">{error} <button type="button" onClick={reload}>Tentar novamente</button></p>}
        <Outlet />
      </main>
    </div>
  </LocalContext.Provider>;
}
