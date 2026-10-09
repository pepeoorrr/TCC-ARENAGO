import React, { useEffect, useState } from 'react';
import { bloqueiosAPI, quadrasAPI } from '../services/api';
import { useLocal, day, errorMessage } from '../components/Workspace';
import { Field } from '../components/Forms';
export default function Blocks() {
  const { params, localId } = useLocal();
  const [rows, setRows] = useState([]), [courts, setCourts] = useState([]), [form, setForm] = useState({ motivo: 'MANUTENCAO' }), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; setForm({ motivo: 'MANUTENCAO' }); setRows([]); setError(''); setLoading(true);
    Promise.all([bloqueiosAPI.listar(params), quadrasAPI.listar(params)]).then(([a, b]) => { if (active) { setRows(a.data); setCourts(b.data.filter(q => q.ativa)); } }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; };
  }, [localId]);
  const act = async action => { setBusy(true); setError(''); try { await action(); setRows((await bloqueiosAPI.listar(params)).data); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  return <section className="space-y-4"><h1 className="text-2xl font-bold">Bloqueios de agenda</h1>{error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p>Carregando...</p> : <><form className="bg-white p-5 rounded space-y-3 max-w-xl" onSubmit={e => { e.preventDefault(); act(() => bloqueiosAPI.criar(form)); }}>
      <Field label="Quadra" required value={form.quadraId || ''} options={courts.map(q => ({ value: q.id, label: q.nome }))} onChange={e => setForm({ ...form, quadraId: e.target.value })} />
      {[['data', 'Data', 'date'], ['horarioInicio', 'Início', 'time'], ['horarioFim', 'Fim', 'time']].map(([key, label, type]) => <Field key={key} label={label} type={type} required value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />)}
      <Field label="Motivo" required value={form.motivo} options={['MANUTENCAO', 'LIMPEZA', 'EVENTO', 'OUTRO'].map(value => ({ value, label: value }))} onChange={e => setForm({ ...form, motivo: e.target.value })} />
      <button disabled={busy} className="bg-blue-700 text-white p-2 rounded">Criar bloqueio</button>
    </form>{rows.map(row => <div className="bg-white p-4 rounded flex justify-between" key={row.id}><span>{row.quadra.nome} · {day(row.dataBloqueio)} · {row.horarioInicio}–{row.horarioFim} · {row.motivo}</span><button disabled={busy} className="text-red-700" onClick={() => act(() => bloqueiosAPI.deletar(row.id))}>Remover bloqueio</button></div>)}</>}
  </section>;
}
