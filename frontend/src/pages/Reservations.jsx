import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, errorMessage, day, currency } from '../components/Workspace';
import { Field, CustomerPicker } from '../components/Forms';
import { reservasAPI, comandasAPI } from '../services/api';
export function ReservationList() {
  const { localId, params } = useLocal(), { usuario } = useAuth();
  const [rows, setRows] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; setLoading(true); setRows([]); setError('');
    reservasAPI.listar(params).then(r => { if (active) setRows(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [localId]);
  return <section className="space-y-4"><h1 className="text-2xl font-bold">{usuario.perfil === 'CLIENTE' ? 'Minhas reservas' : 'Agenda de reservas'}</h1>
    <Link className="text-blue-700" to="/nova-reserva">Fazer reserva</Link>{error && <p role="alert">{error}</p>}
    {loading ? <p>Carregando...</p> : <div className="grid md:grid-cols-2 gap-4">{rows.map(r => <Link className="bg-white p-5 rounded shadow" key={r.id} to={`/reserva/${r.id}`}><h2 className="font-bold">{r.quadra.nome}</h2><p>{day(r.dataReserva)} · {r.horarioInicio}–{r.horarioFim}</p><p>{r.usuario.nome} · {r.status}</p></Link>)}{!rows.length && <p>Nenhuma reserva encontrada.</p>}</div>}
  </section>;
}
export function ReservationDetail() {
  const { id } = useParams(), { usuario } = useAuth();
  const [reserva, setReserva] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [client, setClient] = useState(''), [editing, setEditing] = useState(false), [form, setForm] = useState({}), [motivo, setMotivo] = useState('');
  const load = async () => setReserva((await reservasAPI.obter(id)).data);
  useEffect(() => { let active = true; reservasAPI.obter(id).then(r => { if (active) setReserva(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }); return () => { active = false; }; }, [id]);
  const act = async action => { setBusy(true); setError(''); try { await action(); await load(); setEditing(false); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  if (!reserva) return <p role={error ? 'alert' : undefined}>{error || 'Carregando...'}</p>;
  const active = ['CONFIRMADA', 'ATIVA'].includes(reserva.status), manager = usuario.perfil !== 'CLIENTE';
  return <section className="space-y-5"><h1 className="text-2xl font-bold">Reserva · {reserva.quadra.nome}</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="bg-white p-5 rounded"><p>{day(reserva.dataReserva)} · {reserva.horarioInicio}–{reserva.horarioFim} · {reserva.status}</p><p>Responsável: {reserva.usuario.nome}</p><p>Aluguel: {currency(reserva.valorAluguel)}</p>
      {reserva.status === 'CONFIRMADA' && <button className="text-blue-700 mt-3" onClick={() => { setEditing(true); setForm({ data: reserva.dataReserva.slice(0, 10), horarioInicio: reserva.horarioInicio, duracao: (Number(reserva.horarioFim.slice(0, 2)) * 60 + Number(reserva.horarioFim.slice(3))) - (Number(reserva.horarioInicio.slice(0, 2)) * 60 + Number(reserva.horarioInicio.slice(3))) }); }}>Alterar horário</button>}
    </div>
    {editing && <form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => reservasAPI.atualizar(id, form)); }}>
      {[['data', 'Data', 'date'], ['horarioInicio', 'Horário', 'time'], ['duracao', 'Duração (minutos)', 'number']].map(([key, label, type]) => <Field key={key} label={label} required type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />)}
      <button disabled={busy} className="bg-blue-700 text-white p-2 rounded">Salvar horário</button>
    </form>}
    <h2 className="text-xl font-bold">{manager ? 'Comandas dos participantes' : 'Minha comanda'}</h2>
    {reserva.comandas.map(c => <Link key={c.id} to={`/comanda/${c.id}`} className="block bg-white p-4 rounded shadow">{c.usuario.nome} · {currency(c.total)} · {c.status}</Link>)}
    {manager && active && <div className="bg-white p-5 space-y-3 rounded"><h3 className="font-semibold">Adicionar participante</h3><CustomerPicker onSelect={setClient} /><button disabled={busy || !client} className="bg-blue-700 text-white p-2 rounded" onClick={() => act(() => comandasAPI.criar(id, client))}>Abrir comanda do participante</button></div>}
    {active && <form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => reservasAPI.cancelar(id, motivo)); }}><Field label="Motivo do cancelamento" required value={motivo} onChange={e => setMotivo(e.target.value)} /><p className="text-sm">Cancelamento permitido sem consumo ou pagamento. Clientes precisam de duas horas de antecedência.</p><button disabled={busy} className="bg-red-700 text-white p-2 rounded">Cancelar reserva</button></form>}
  </section>;
}
