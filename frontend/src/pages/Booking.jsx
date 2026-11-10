import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, errorMessage, currency } from '../components/Workspace';
import { Field, CustomerPicker } from '../components/Forms';
import { quadrasAPI, reservasAPI, disponibilidadeAPI } from '../services/api';
const ArrowIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const modalityName = { BEACH_TENNIS: 'Beach tennis', FUTEVOLEI: 'Futevôlei', VOLEI: 'Vôlei de areia', FUTSAL: 'Futsal', BASQUETE: 'Basquete', TENIS: 'Tênis', OUTRO: 'Outro' };
export default function Booking() {
  const { usuario } = useAuth(), { locais } = useLocal(), navigate = useNavigate(), location = useLocation();
  const prefill = location.state?.prefillBooking || {};
  const [local, setLocal] = useState(prefill.estabelecimentoId || ''), [quadras, setQuadras] = useState([]), [quadraId, setQuadra] = useState(prefill.quadraId || '');
  const [data, setData] = useState(prefill.data || ''), [horarioInicio, setHora] = useState(prefill.horarioInicio || ''), [duracao, setDuracao] = useState(60), [usuarioId, setUsuario] = useState('');
  const [slots, setSlots] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false), [loadingSlots, setLoadingSlots] = useState(false);
  useEffect(() => {
    let active = true; setQuadras([]); setSlots([]); setError('');
    if (!local) return;
    setLoading(true);
    quadrasAPI.listar({ estabelecimentoId: local }).then(r => { if (active) {
      const activeCourts = r.data.filter(q => q.ativa); setQuadras(activeCourts);
      const selectedCourt = activeCourts.find(q => q.id === quadraId);
      if (selectedCourt) setDuracao(selectedCourt.durationPadraoMinutos || 60);
      else if (quadraId) { setQuadra(''); setHora(''); }
    } })
      .catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [local]);
  useEffect(() => {
    let active = true; setSlots([]); setHora('');
    if (!quadraId || !data) return;
    setLoadingSlots(true);
    disponibilidadeAPI.obter(quadraId, { dataInicio: data, dataFim: data }).then(r => { if (active) setSlots(r.data.disponibilidade[0]?.horarios || []); })
      .catch(e => { if (active) setError(errorMessage(e)); })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [quadraId, data]);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { const response = await reservasAPI.criar({ quadraId, data, horarioInicio, duracao: Number(duracao), ...(usuario.perfil !== 'CLIENTE' && { usuarioId }) }); navigate(`/reserva/${response.data.reserva.id}`); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const quadra = quadras.find(q => q.id === quadraId);
  return <section className="booking-page">
    <div className="page-heading"><div><span className="page-eyebrow">VAMOS JOGAR?</span><h1>Agende sua quadra</h1><p>Escolha arena, modalidade, data e horário para confirmar sua partida.</p></div><Link className="button button--outline" to="/dashboard">Voltar ao painel</Link></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <form onSubmit={submit} className="booking-card">
      <div className="booking-card__intro"><span>1</span><div><h2>Escolha a quadra</h2><p>Selecione um estabelecimento ativo e a quadra de areia.</p></div></div>
      <div className="booking-grid"><Field label="Arena" required value={local} options={locais.filter(l => l.ativo).map(l => ({ value: l.id, label: l.nome }))} onChange={e => { setLocal(e.target.value); setQuadra(''); setHora(''); setSlots([]); }} />
        <Field label="Quadra e modalidade" required disabled={!local || loading} value={quadraId} options={quadras.map(q => ({ value: q.id, label: `${q.nome} · ${modalityName[q.tipo] || q.tipo} · ${currency(q.precoHora)}/h` }))} onChange={e => { setQuadra(e.target.value); setDuracao(quadras.find(q => q.id === e.target.value)?.durationPadraoMinutos || 60); setHora(''); }} />
      </div>
      {loading && <p className="booking-hint">Carregando quadras da arena…</p>}
      <div className="booking-card__intro"><span>2</span><div><h2>Encontre seu horário</h2><p>Veja os horários abertos para a data escolhida.</p></div></div>
      <div className="booking-grid booking-grid--date"><Field label="Data" type="date" min={new Date().toISOString().slice(0, 10)} required value={data} onChange={e => { setData(e.target.value); setHora(''); }} /><Field label="Duração (minutos)" type="number" min="1" required value={duracao} onChange={e => setDuracao(e.target.value)} /></div>
      {loadingSlots && <p className="booking-hint">Consultando disponibilidade…</p>}
      {quadraId && data && !loadingSlots && <div className="booking-slots"><strong>Horários disponíveis</strong><div className="booking-slots__list">{slots.filter(slot => slot.disponivel).map(slot => <button type="button" key={slot.hora} className={horarioInicio === slot.hora ? 'is-selected' : ''} onClick={() => { setHora(slot.hora); setDuracao(slot.duracao); }}>{slot.hora}</button>)}{slots.length > 0 && !slots.some(slot => slot.disponivel) && <p>Nenhum horário disponível nesta data. Escolha outro dia.</p>}{!slots.length && <p>Não há horários configurados para esta quadra.</p>}</div></div>}
      {usuario.perfil !== 'CLIENTE' && <div className="booking-card__participant"><div className="booking-card__intro"><span>3</span><div><h2>Quem vai jogar?</h2><p>Como gestor, selecione o cliente responsável pela reserva.</p></div></div><CustomerPicker onSelect={setUsuario} /></div>}
      {quadra && <div className="booking-summary"><span>Valor estimado · {duracao} min</span><strong>{currency(Number(quadra.precoHora) * Number(duracao) / 60)}</strong></div>}
      <button className="button button--sand booking-submit" disabled={busy || !quadraId || !data || !horarioInicio || (usuario.perfil !== 'CLIENTE' && !usuarioId)}>{busy ? 'Confirmando…' : 'Confirmar reserva'} <ArrowIcon /></button>
    </form>
  </section>;
}
