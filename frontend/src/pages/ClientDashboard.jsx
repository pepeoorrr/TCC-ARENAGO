import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservasAPI } from '../services/api';
import { currency, day, errorMessage } from '../components/Workspace';

export default function ClientDashboard() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    try { setReservas((await reservasAPI.listar()).data); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const upcoming = reservas.filter(item => ['CONFIRMADA', 'ATIVA'].includes(item.status))
    .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva) || a.horarioInicio.localeCompare(b.horarioInicio));
  const next = upcoming[0];
  return <section className="client-dashboard">
    <div className="client-welcome"><div><span className="page-eyebrow">SEU ESPAÇO DE JOGO</span><h1>Bom jogo começa com planejamento.</h1><p>Acompanhe suas partidas e organize sua próxima ida à areia.</p></div><Link className="button button--sand" to="/nova-reserva">Agendar quadra <span aria-hidden="true">↗</span></Link></div>
    {error && <div className="dashboard-error" role="alert"><span>{error}</span><button type="button" className="button button--outline" onClick={carregar}>Tentar novamente</button></div>}
    <div className="client-dashboard__stats"><article><span className="client-stat-icon">◷</span><div><small>Reservas ativas</small><strong>{loading ? '—' : upcoming.length}</strong></div></article><article><span className="client-stat-icon">✳</span><div><small>Partida mais próxima</small><strong>{loading ? '—' : next ? day(next.dataReserva) : 'Aguardando jogo'}</strong></div></article><article><span className="client-stat-icon">▤</span><div><small>Minhas reservas</small><strong>{loading ? '—' : reservas.length}</strong></div></article></div>
    <div className="dashboard-section-heading"><div><span className="page-eyebrow">SUA AGENDA</span><h2>Próximas partidas</h2></div><Link to="/minhas-reservas">Ver todas <span aria-hidden="true">→</span></Link></div>
    {loading ? <div className="dashboard-loading"><span className="loading-spinner" /> Carregando suas partidas…</div> : upcoming.length ? <div className="dashboard-reservations">{upcoming.slice(0, 3).map(reserva => <Link className="dashboard-reservation" to={`/reserva/${reserva.id}`} key={reserva.id}><span className="reservation-date"><strong>{reserva.dataReserva.slice(8, 10)}</strong><small>{new Date(`${reserva.dataReserva.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></span><span className="reservation-main"><strong>{reserva.quadra.nome}</strong><small>{reserva.quadra.estabelecimento?.nome || 'Arena'} · {reserva.horarioInicio}–{reserva.horarioFim}</small></span><span className="reservation-price">{currency(reserva.valorAluguel)}<small>{reserva.status === 'ATIVA' ? 'Em andamento' : 'Confirmada'}</small></span><span className="reservation-arrow">→</span></Link>)}</div> : !error && <div className="dashboard-empty"><span aria-hidden="true">✳</span><h3>Seu próximo jogo está esperando.</h3><p>Encontre uma quadra de areia e reserve um horário para sua próxima partida.</p><Link className="button button--sand" to="/">Buscar quadras <span aria-hidden="true">↗</span></Link></div>}
    <div className="client-shortcuts"><Link to="/comandas"><span>▤</span><div><strong>Minhas comandas</strong><small>Acompanhe os detalhes das suas cobranças.</small></div><b>→</b></Link><Link to="/perfil"><span>◉</span><div><strong>Meu perfil</strong><small>Mantenha seus dados atualizados.</small></div><b>→</b></Link></div>
  </section>;
}
