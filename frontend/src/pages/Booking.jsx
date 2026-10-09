import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, errorMessage, currency } from '../components/Workspace';
import { Field, CustomerPicker } from '../components/Forms';
import { quadrasAPI, reservasAPI, disponibilidadeAPI } from '../services/api';
export default function Booking() {
  const { usuario } = useAuth(), { locais } = useLocal(), navigate = useNavigate();
  const [local, setLocal] = useState(''), [quadras, setQuadras] = useState([]), [quadraId, setQuadra] = useState('');
  const [data, setData] = useState(''), [horarioInicio, setHora] = useState(''), [duracao, setDuracao] = useState(60), [usuarioId, setUsuario] = useState('');
  const [slots, setSlots] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true; setQuadras([]); setQuadra(''); setSlots([]); setError('');
    if (!local) return;
    setLoading(true);
    quadrasAPI.listar({ estabelecimentoId: local }).then(r => { if (active) setQuadras(r.data.filter(q => q.ativa)); })
      .catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [local]);
  useEffect(() => {
    let active = true; setSlots([]); setHora('');
    if (!quadraId || !data) return;
    disponibilidadeAPI.obter(quadraId, { dataInicio: data, dataFim: data }).then(r => { if (active) setSlots(r.data.disponibilidade[0]?.horarios || []); })
      .catch(e => { if (active) setError(errorMessage(e)); });
    return () => { active = false; };
  }, [quadraId, data]);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { const response = await reservasAPI.criar({ quadraId, data, horarioInicio, duracao: Number(duracao), ...(usuario.perfil !== 'CLIENTE' && { usuarioId }) }); navigate(`/reserva/${response.data.reserva.id}`); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const quadra = quadras.find(q => q.id === quadraId);
  return <section className="max-w-2xl space-y-4"><h1 className="text-2xl font-bold">Nova reserva</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <form onSubmit={submit} className="bg-white p-5 rounded shadow space-y-4">
      <Field label="Local da reserva" required value={local} options={locais.filter(l => l.ativo).map(l => ({ value: l.id, label: l.nome }))} onChange={e => setLocal(e.target.value)} />
      {loading && <p>Carregando quadras...</p>}
      <Field label="Quadra" required disabled={!local || loading} value={quadraId} options={quadras.map(q => ({ value: q.id, label: `${q.nome} — ${currency(q.precoHora)}/hora` }))} onChange={e => { setQuadra(e.target.value); setDuracao(quadras.find(q => q.id === e.target.value)?.durationPadraoMinutos || 60); }} />
      <Field label="Data" type="date" required value={data} onChange={e => setData(e.target.value)} />
      {slots.length > 0 && <div><p className="text-sm">Horários disponíveis para a duração padrão:</p><div className="flex flex-wrap gap-2 mt-2">{slots.map(s => <button type="button" key={s.hora} disabled={!s.disponivel} className="border p-2 rounded disabled:opacity-30" onClick={() => { setHora(s.hora); setDuracao(s.duracao); }}>{s.hora}</button>)}</div></div>}
      <Field label="Horário de início" type="time" required value={horarioInicio} onChange={e => setHora(e.target.value)} />
      <Field label="Duração (minutos)" type="number" min="1" required value={duracao} onChange={e => setDuracao(e.target.value)} />
      {usuario.perfil !== 'CLIENTE' && <CustomerPicker onSelect={setUsuario} />}
      {quadra && <p>Aluguel estimado: <strong>{currency(Number(quadra.precoHora) * Number(duracao) / 60)}</strong></p>}
      <button className="bg-blue-700 text-white p-3 rounded disabled:opacity-50" disabled={busy || !quadraId || (usuario.perfil !== 'CLIENTE' && !usuarioId)}>{busy ? 'Reservando...' : 'Confirmar reserva'}</button>
    </form>
  </section>;
}
