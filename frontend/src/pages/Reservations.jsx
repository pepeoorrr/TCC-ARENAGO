import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, errorMessage, day, currency } from '../components/Workspace';
import { Field, CustomerPicker } from '../components/Forms';
import { reservasAPI, comandasAPI } from '../services/api';
export function ReservationList() {
  const { localId, params } = useLocal(), { usuario } = useAuth();
  const [rows, setRows] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true), [filter, setFilter] = useState('TODAS');
  const load = async () => { setLoading(true); setError(''); try { setRows((await reservasAPI.listar(params)).data); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { let active = true; setLoading(true); setRows([]); setError('');
    reservasAPI.listar(params).then(r => { if (active) setRows(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [localId]);
  const visible = rows.filter(r => filter === 'TODAS' || (filter === 'ATIVAS' ? ['CONFIRMADA', 'ATIVA'].includes(r.status) : r.status === filter));
  const manager = usuario.perfil !== 'CLIENTE';
  return <section className="reservations-page">
    <div className="page-heading"><div><span className="page-eyebrow">{manager ? 'OPERAÇÃO DA ARENA' : 'SUA AGENDA DE JOGO'}</span><h1>{manager ? 'Agenda de reservas' : 'Minhas reservas'}</h1><p>{manager ? 'Acompanhe reservas e horários do estabelecimento.' : 'Confira suas partidas futuras e seu histórico.'}</p></div><Link className="button button--sand" to="/nova-reserva">Nova reserva <span aria-hidden="true">↗</span></Link></div>
    <div className="reservation-filters" aria-label="Filtrar reservas">{[['TODAS', 'Todas'], ['ATIVAS', 'Ativas'], ['FINALIZADA', 'Finalizadas'], ['CANCELADA', 'Canceladas']].map(([value, label]) => <button key={value} type="button" className={filter === value ? 'is-selected' : ''} onClick={() => setFilter(value)}>{label}<span>{value === 'TODAS' ? rows.length : rows.filter(row => value === 'ATIVAS' ? ['CONFIRMADA', 'ATIVA'].includes(row.status) : row.status === value).length}</span></button>)}</div>
    {error && <div role="alert" className="dashboard-error"><span>{error}</span><button type="button" className="button button--outline" onClick={load}>Tentar novamente</button></div>}
    {loading ? <div className="dashboard-loading"><span className="loading-spinner" /> Carregando reservas…</div> : visible.length ? <div className="reservation-list">{visible.map(r => <Link className="reservation-list__item" key={r.id} to={`/reserva/${r.id}`}><span className="reservation-list__date"><strong>{r.dataReserva.slice(8, 10)}</strong><small>{new Date(`${r.dataReserva.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></span><span className="reservation-list__main"><strong>{r.quadra.nome}</strong><small>{r.quadra.estabelecimento?.nome || 'Arena'} · {day(r.dataReserva)} · {r.horarioInicio}–{r.horarioFim}</small>{manager && <small>Responsável: {r.usuario.nome}</small>}</span><span className={`status-pill status-pill--${r.status.toLowerCase()}`}>{({ CONFIRMADA: 'Confirmada', ATIVA: 'Em andamento', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada' })[r.status] || r.status}</span><span className="reservation-list__arrow">→</span></Link>)}</div> : <div className="dashboard-empty"><span aria-hidden="true">✳</span><h3>{filter === 'TODAS' ? 'Nenhuma reserva por aqui ainda.' : 'Nenhuma reserva neste filtro.'}</h3><p>{manager ? 'Quando os jogadores reservarem uma quadra, as partidas vão aparecer aqui.' : 'Escolha uma quadra de areia para marcar seu próximo jogo.'}</p>{!manager && <Link className="button button--sand" to="/">Buscar quadras <span aria-hidden="true">↗</span></Link>}</div>}
  </section>;
}
export function ReservationDetail() {
  const { id } = useParams(), { usuario } = useAuth();
  const [reserva, setReserva] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [client, setClient] = useState(''), [editing, setEditing] = useState(false), [form, setForm] = useState({}), [motivo, setMotivo] = useState('');
  const load = async () => setReserva((await reservasAPI.obter(id)).data);
  useEffect(() => { let active = true; reservasAPI.obter(id).then(r => { if (active) setReserva(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }); return () => { active = false; }; }, [id]);
  const act = async action => { setBusy(true); setError(''); try { await action(); await load(); setEditing(false); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  if (!reserva) return error ? <div className="dashboard-error" role="alert"><span>{error}</span><button type="button" className="button button--outline" onClick={() => { setError(''); reservasAPI.obter(id).then(r => setReserva(r.data)).catch(e => setError(errorMessage(e))); }}>Tentar novamente</button></div> : <div className="dashboard-loading"><span className="loading-spinner" /> Carregando reserva…</div>;
  const active = ['CONFIRMADA', 'ATIVA'].includes(reserva.status), manager = usuario.perfil !== 'CLIENTE';
  return <section className="space-y-5"><h1 className="text-2xl font-bold">Reserva · {reserva.quadra.nome}</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="bg-white p-5 rounded"><p>{day(reserva.dataReserva)} · {reserva.horarioInicio}–{reserva.horarioFim} · {reserva.status}</p><p>Responsável: {reserva.usuario.nome}</p><p>Aluguel: {currency(reserva.valorAluguel)}</p>
      {reserva.status === 'CONFIRMADA' && <button className="text-blue-700 mt-3" onClick={() => { setEditing(true); setForm({ data: reserva.dataReserva.slice(0, 10), horarioInicio: reserva.horarioInicio, duracao: (Number(reserva.horarioFim.slice(0, 2)) * 60 + Number(reserva.horarioFim.slice(3))) - (Number(reserva.horarioInicio.slice(0, 2)) * 60 + Number(reserva.horarioInicio.slice(3))) }); }}>Alterar horário</button>}
    </div>
    {editing && <form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => reservasAPI.atualizar(id, form)); }}>
      {[['data', 'Data', 'date'], ['horarioInicio', 'Horário', 'time'], ['duracao', 'Duração (minutos)', 'number']].map(([key, label, type]) => <Field key={key} label={label} required type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />)}
      <div className="flex gap-2"><button disabled={busy} className="bg-blue-700 text-white p-2 rounded">{busy ? 'Salvando…' : 'Salvar horário'}</button><button type="button" disabled={busy} className="button button--outline" onClick={() => setEditing(false)}>Cancelar edição</button></div>
    </form>}
    <h2 className="text-xl font-bold">{manager ? 'Comandas dos participantes' : 'Minha comanda'}</h2>
    {reserva.comandas.map(c => <Link key={c.id} to={`/comanda/${c.id}`} className="block bg-white p-4 rounded shadow">{c.usuario.nome} · {currency(c.total)} · {c.status}</Link>)}
    {manager && active && <div className="bg-white p-5 space-y-3 rounded"><h3 className="font-semibold">Adicionar participante</h3><CustomerPicker onSelect={setClient} /><button disabled={busy || !client} className="bg-blue-700 text-white p-2 rounded" onClick={() => act(() => comandasAPI.criar(id, client))}>Abrir comanda do participante</button></div>}
    {active && <form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => reservasAPI.cancelar(id, motivo)); }}><Field label="Motivo do cancelamento" required value={motivo} onChange={e => setMotivo(e.target.value)} /><p className="text-sm">Cancelamento permitido sem consumo ou pagamento. Clientes precisam de duas horas de antecedência.</p><button disabled={busy} className="bg-red-700 text-white p-2 rounded">Cancelar reserva</button></form>}
  </section>;
}
