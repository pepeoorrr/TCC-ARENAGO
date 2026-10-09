import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, errorMessage, currency } from '../components/Workspace';
import { Field } from '../components/Forms';
import { estabelecimentosAPI, quadrasAPI, categoriasAPI, produtosAPI, usuariosAPI } from '../services/api';
const configs = {
  estabelecimentos: { title: 'Estabelecimentos', api: estabelecimentosAPI, fields: [['nome', 'Nome'], ['endereco', 'Endereço'], ['contato', 'Contato']] },
  quadras: { title: 'Quadras', api: quadrasAPI, fields: [['nome', 'Nome'], ['tipo', 'Modalidade'], ['capacidade', 'Capacidade', 'number'], ['precoHora', 'Preço por hora', 'number'], ['horarioInicio', 'Abertura', 'time'], ['horarioFim', 'Fechamento', 'time'], ['durationPadraoMinutos', 'Duração padrão (minutos)', 'number']] },
  categorias: { title: 'Categorias', api: categoriasAPI, fields: [['nome', 'Nome'], ['descricao', 'Descrição', 'text', false]] },
  produtos: { title: 'Produtos e estoque', api: produtosAPI, fields: [['nome', 'Nome'], ['categoriaId', 'Categoria'], ['preco', 'Preço', 'number'], ['estoqueAtual', 'Estoque atual', 'number'], ['estoqueMinimo', 'Estoque mínimo', 'number']] },
  usuarios: { title: 'Usuários', api: usuariosAPI, fields: [['nome', 'Nome'], ['email', 'Email', 'email'], ['senha', 'Senha inicial', 'password'], ['perfil', 'Perfil']] }
};
export default function Management() {
  const { recurso } = useParams(), config = configs[recurso];
  const { usuario } = useAuth(), { localId, params, reload: reloadLocais } = useLocal();
  const [rows, setRows] = useState([]), [form, setForm] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [choices, setChoices] = useState([]);
  const generation = useRef(0);
  const allowed = config && (recurso !== 'usuarios' || usuario.perfil === 'ADMIN');
  useEffect(() => {
    let active = true; generation.current++; setBusy(false); setForm(null); setLoading(true); setError(''); setMessage(''); setRows([]);
    if (!allowed) { setLoading(false); return; }
    const load = async () => {
      try {
        const { data } = await config.api.listar(params);
        const extra = recurso === 'produtos' ? await categoriasAPI.listar(params) : recurso === 'estabelecimentos' && usuario.perfil === 'ADMIN' ? await usuariosAPI.listar({ perfil: 'PROPRIETARIO' }) : { data: [] };
        if (active) { setRows(data); setChoices(extra.data); }
      } catch (e) { if (active) setError(errorMessage(e)); } finally { if (active) setLoading(false); }
    }; load(); return () => { active = false; };
  }, [recurso, localId, allowed]);
  if (!allowed) return <p role="alert">Acesso não permitido.</p>;
  const perLocal = ['quadras', 'categorias', 'produtos'].includes(recurso);
  const options = key => {
    if (key === 'tipo') return ['FUTSAL', 'VOLEI', 'BASQUETE', 'TENIS', 'OUTRO'].map(value => ({ value, label: value }));
    if (key === 'perfil') return ['ADMIN', 'PROPRIETARIO', 'CLIENTE'].map(value => ({ value, label: value === 'PROPRIETARIO' ? 'Proprietário' : value }));
    if (key === 'categoriaId') return choices.filter(c => c.ativa && c.estabelecimentoId === (form?.estabelecimentoId || localId)).map(c => ({ value: c.id, label: c.nome }));
    if (key === 'proprietarioId') return choices.filter(c => c.ativo).map(c => ({ value: c.id, label: c.nome }));
  };
  const save = async e => {
    e.preventDefault(); const requestGeneration = generation.current; setBusy(true); setError(''); setMessage('');
    try {
      const data = {};
      for (const [key, , type] of config.fields) {
        if (form.id && recurso === 'usuarios' && ['senha', 'email'].includes(key)) continue;
        data[key] = type === 'number' ? Number(form[key]) : form[key];
      }
      if (perLocal && !form.id) data.estabelecimentoId = localId;
      if (recurso === 'estabelecimentos' && usuario.perfil === 'ADMIN') data.proprietarioId = form.proprietarioId;
      if (form.id && !(recurso === 'estabelecimentos' && usuario.perfil !== 'ADMIN')) data[recurso === 'quadras' || recurso === 'categorias' ? 'ativa' : 'ativo'] = form[recurso === 'quadras' || recurso === 'categorias' ? 'ativa' : 'ativo'];
      if (form.id) await config.api.atualizar(form.id, data); else await config.api.criar(data);
      const refreshed = (await config.api.listar(params)).data;
      if (generation.current === requestGeneration) { setRows(refreshed); setForm(null); setMessage('Cadastro salvo.'); }
      if (recurso === 'estabelecimentos') await reloadLocais();
    } catch (e) { if (generation.current === requestGeneration) setError(errorMessage(e)); } finally { if (generation.current === requestGeneration) setBusy(false); }
  };
  return <section className="space-y-4"><h1 className="text-2xl font-bold">{config.title}</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-green-800">{message}</p>}
    {loading ? <p>Carregando...</p> : <>
      {(recurso !== 'estabelecimentos' || usuario.perfil === 'ADMIN') && <button className="bg-blue-700 text-white p-2 rounded" disabled={busy || (perLocal && !localId)} onClick={() => setForm({ nome: '', horarioInicio: '06:00', horarioFim: '22:00', durationPadraoMinutos: 60, capacidade: 10, estoqueAtual: 0, estoqueMinimo: 5, perfil: 'CLIENTE' })}>Novo cadastro</button>}
      {perLocal && !localId && <p>Selecione um estabelecimento para cadastrar.</p>}
      {form && <form onSubmit={save} className="bg-white p-5 rounded shadow grid md:grid-cols-2 gap-4">
        {config.fields.filter(([key]) => !(form.id && recurso === 'usuarios' && key === 'senha')).map(([key, label, type, required]) => <Field key={key} label={label} type={type || 'text'} options={options(key)} required={required !== false} disabled={busy || (form.id && key === 'email')} value={form[key] ?? ''} min={type === 'number' ? (['estoqueAtual', 'estoqueMinimo', 'preco', 'precoHora'].includes(key) ? 0 : 1) : undefined} step={['preco', 'precoHora'].includes(key) ? '0.01' : undefined} onChange={e => setForm({ ...form, [key]: e.target.value })} />)}
        {recurso === 'estabelecimentos' && usuario.perfil === 'ADMIN' && <Field label="Proprietário" required options={options('proprietarioId')} value={form.proprietarioId || ''} onChange={e => setForm({ ...form, proprietarioId: e.target.value })} />}
        {form.id && !(recurso === 'estabelecimentos' && usuario.perfil !== 'ADMIN') && <label><input type="checkbox" checked={!!form[recurso === 'quadras' || recurso === 'categorias' ? 'ativa' : 'ativo']} onChange={e => setForm({ ...form, [recurso === 'quadras' || recurso === 'categorias' ? 'ativa' : 'ativo']: e.target.checked })} /> Ativo</label>}
        <div className="flex gap-3"><button disabled={busy} className="bg-blue-700 text-white p-2 rounded">{busy ? 'Salvando...' : 'Salvar'}</button><button disabled={busy} type="button" onClick={() => setForm(null)}>Cancelar</button></div>
      </form>}
      <div className="overflow-x-auto bg-white rounded"><table className="w-full text-left"><thead><tr><th className="p-3">Nome</th><th>Informações</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="p-3">{row.nome}</td><td>{row.email || row.endereco || (row.preco !== undefined ? `${currency(row.preco)} · Estoque: ${row.estoqueAtual}` : row.tipo || row.descricao)}</td><td>{(row.ativo ?? row.ativa) ? 'Ativo' : 'Inativo'}</td><td><button disabled={busy} className="text-blue-700 p-2" onClick={() => { setForm(row); setMessage(''); }}>Editar</button></td></tr>)}</tbody>
      </table>{rows.length === 0 && <p className="p-4">Nenhum registro encontrado.</p>}</div>
    </>}
  </section>;
}
