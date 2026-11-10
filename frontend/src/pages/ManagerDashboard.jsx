import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useLocal, currency, errorMessage, day } from '../components/Workspace';
export default function ManagerDashboard() {
  const { localId, params } = useLocal();
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData((await dashboardAPI.obter(params)).data); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [localId]);
  useEffect(() => { load(); }, [load]);
  return <section className="space-y-5"><div className="dashboard-section-heading"><div><span className="page-eyebrow">VISÃO GERAL DA ARENA</span><h1>Painel de gestão</h1></div><div className="manager-quick-actions"><Link className="button button--outline" to="/agenda">Abrir agenda</Link><Link className="button button--sand" to="/gerenciamento/quadras">Gerenciar quadras</Link></div></div>{error && <div role="alert" className="dashboard-error"><span>{error}</span><button className="button button--outline" type="button" onClick={load}>Tentar novamente</button></div>}
    {loading ? <div className="dashboard-loading"><span className="loading-spinner" /> Atualizando dados…</div> : !data ? null : <><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[['Receita do dia', currency(data.receitaDia)], ['Receita do mês', currency(data.receitaMes)], ['Reservas do dia', data.reservasHoje], ['Ocupação do dia', `${data.taxaOcupacao}%`], ['Estoque baixo', data.produtosBaixoEstoque], ['Aguardando pagamento', data.comandasAguardando]].map(([name, value]) => <div key={name} className="bg-white p-5 rounded shadow"><p>{name}</p><strong className="text-2xl">{value}</strong></div>)}
    </div><h2 className="text-xl font-bold">Próximas reservas</h2><div className="bg-white p-5 rounded space-y-3">{data.proximasReservas.map(r => <Link className="block text-blue-700" key={r.id} to={`/reserva/${r.id}`}>{r.quadra} · {r.cliente} · {day(r.dataReserva)} {r.horarioInicio}</Link>)}{!data.proximasReservas.length && <p>Nenhuma reserva próxima.</p>}</div>
    <h2 className="text-xl font-bold">Produtos mais vendidos no mês</h2><div className="bg-white p-5 rounded">{data.produtosMaisVendidos.map(p => <p key={p.produtoId}>{p.nome} · {p.quantidade} unidades · {currency(p.receita)}</p>)}{!data.produtosMaisVendidos.length && <p>Nenhum consumo pago no mês.</p>}</div></>}
  </section>;
}
