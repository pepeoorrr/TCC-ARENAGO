import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocal, currency, day, errorMessage } from '../components/Workspace';
import { Field } from '../components/Forms';
import { comandasAPI, produtosAPI } from '../services/api';
export function BillList() {
  const { localId, params } = useLocal(), { usuario } = useAuth();
  const [rows, setRows] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; setRows([]); setError(''); setLoading(true);
    comandasAPI.listar(params).then(r => { if (active) setRows(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; };
  }, [localId]);
  return <section className="space-y-4"><h1 className="text-2xl font-bold">{usuario.perfil === 'CLIENTE' ? 'Minhas comandas' : 'Comandas'}</h1>
    {error && <p role="alert">{error}</p>}{loading ? <p>Carregando...</p> : rows.map(c => <Link key={c.id} to={`/comanda/${c.id}`} className="block bg-white p-4 rounded shadow"><strong>{c.usuario.nome}</strong> · {c.reserva.quadra.nome} · {day(c.reserva.dataReserva)}<p>{currency(c.total)} · {c.status}</p></Link>)}{!loading && !rows.length && <p>Nenhuma comanda encontrada.</p>}
  </section>;
}
export function BillDetail() {
  const { id } = useParams(), { usuario } = useAuth(), manager = usuario.perfil !== 'CLIENTE';
  const [bill, setBill] = useState(null), [products, setProducts] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [produtoId, setProduto] = useState(''), [quantidade, setQuantidade] = useState(1), [formaPagamento, setForma] = useState('PIX'), [valorPago, setPago] = useState('');
  const load = async () => {
    const { data } = await comandasAPI.obter(id); setBill(data); setPago(data.total);
    if (manager) setProducts((await produtosAPI.listar({ estabelecimentoId: data.reserva.quadra.estabelecimentoId })).data.filter(p => p.ativo));
  };
  useEffect(() => {
    let active = true; setBill(null); setError(''); setProducts([]);
    const fetchBill = async () => {
      try {
        const { data } = await comandasAPI.obter(id);
        const result = manager ? await produtosAPI.listar({ estabelecimentoId: data.reserva.quadra.estabelecimentoId }) : { data: [] };
        if (active) { setBill(data); setPago(data.total); setProducts(result.data.filter(p => p.ativo)); }
      } catch (e) { if (active) setError(errorMessage(e)); }
    };
    fetchBill(); return () => { active = false; };
  }, [id, manager]);
  const act = async action => { setBusy(true); setError(''); try { await action(); await load(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } };
  if (!bill) return <p role={error ? 'alert' : undefined}>{error || 'Carregando...'}</p>;
  return <section className="space-y-5"><h1 className="text-2xl font-bold">Comanda de {bill.usuario.nome}</h1>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="bg-white p-5 rounded space-y-2"><p>{bill.reserva.quadra.nome} · {day(bill.reserva.dataReserva)} · {bill.status}</p><p>Aluguel: {currency(bill.valorAluguel)}</p><p>Consumo: {currency(bill.subtotalConsumos)}</p><p className="text-xl font-bold">Total: {currency(bill.total)}</p>
      {bill.status === 'PAGA' && <p>Pagamento: {bill.formaPagamento} · Recebido: {currency(bill.valorPago)} · Troco: {currency(bill.troco)}</p>}
    </div>
    <div className="bg-white p-5 rounded"><h2 className="font-bold mb-3">Consumos</h2>{bill.itens.map(i => <div className="flex gap-4 justify-between border-b py-3" key={i.id}><span>{i.quantidade} × {i.produto.nome} · {currency(i.subtotal)}</span>{manager && bill.status === 'ABERTA' && <button disabled={busy} className="text-red-700" onClick={() => act(() => comandasAPI.removerItem(id, i.id))}>Remover</button>}</div>)}{!bill.itens.length && <p>Nenhum consumo lançado.</p>}</div>
    {manager && bill.status === 'ABERTA' && <><form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => comandasAPI.adicionarItem(id, { produtoId, quantidade: Number(quantidade) })); }}>
      <Field label="Produto" required value={produtoId} options={products.map(p => ({ value: p.id, label: `${p.nome} — ${currency(p.preco)} (estoque: ${p.estoqueAtual})` }))} onChange={e => setProduto(e.target.value)} />
      <Field label="Quantidade" type="number" min="1" step="1" required value={quantidade} onChange={e => setQuantidade(e.target.value)} /><button disabled={busy} className="bg-blue-700 text-white p-2 rounded">Lançar consumo</button>
    </form><button disabled={busy} className="bg-slate-800 text-white p-3 rounded" onClick={() => act(() => comandasAPI.fechar(id))}>Fechar comanda</button></>}
    {manager && bill.status === 'AGUARDANDO_PAGAMENTO' && <form className="bg-white p-5 space-y-3 rounded" onSubmit={e => { e.preventDefault(); act(() => comandasAPI.registrarPagamento(id, { formaPagamento, valorPago: formaPagamento === 'DINHEIRO' ? valorPago : bill.total })); }}>
      <Field label="Forma de pagamento" required options={['PIX', 'CARTAO', 'DINHEIRO'].map(value => ({ value, label: value }))} value={formaPagamento} onChange={e => setForma(e.target.value)} />
      {formaPagamento === 'DINHEIRO' && <Field label="Valor recebido" required type="number" step="0.01" min={bill.total} value={valorPago} onChange={e => setPago(e.target.value)} />}
      <button disabled={busy} className="bg-green-700 text-white p-3 rounded">Registrar pagamento</button>
    </form>}
    {manager && !['PAGA', 'CANCELADA'].includes(bill.status) && !bill.itens.length && bill.usuarioId !== bill.reserva.usuarioId && <button disabled={busy} className="text-red-700" onClick={() => act(() => comandasAPI.cancelar(id))}>Cancelar comanda sem consumo</button>}
  </section>;
}
