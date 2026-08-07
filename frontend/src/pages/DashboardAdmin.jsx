import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { Button, Card, Alert, Loading } from '../components/UI';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const response = await dashboardAPI.obter();
      setDados(response.data.dados);
    } catch (error) {
      setErro('Erro ao carregar dados do dashboard');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  if (carregando) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ArenaGo</h1>
            <p className="text-gray-600">Admin Dashboard - {usuario?.nome}</p>
          </div>
          <div className="space-x-3">
            <Link to="/gerenciamento/quadras">
              <Button variant="secondary" size="sm">Quadras</Button>
            </Link>
            <Link to="/gerenciamento/produtos">
              <Button variant="secondary" size="sm">Produtos</Button>
            </Link>
            <Link to="/gerenciamento/usuarios">
              <Button variant="secondary" size="sm">Usuários</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        {/* KPIs - Primeira Linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Receita do Dia */}
          <Card className="border-l-4 border-l-green-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Receita do Dia</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatarMoeda(dados?.receitaDia)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hoje</p>
            </div>
          </Card>

          {/* Receita do Mês */}
          <Card className="border-l-4 border-l-blue-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Receita do Mês</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {formatarMoeda(dados?.receitaMes)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mês atual</p>
            </div>
          </Card>

          {/* Reservas Hoje */}
          <Card className="border-l-4 border-l-orange-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reservas Hoje</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {dados?.reservasHoje || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Confirmadas e ativas</p>
            </div>
          </Card>

          {/* Taxa de Ocupação */}
          <Card className="border-l-4 border-l-purple-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Taxa de Ocupação</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {dados?.taxaOcupacao || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Hoje</p>
            </div>
          </Card>
        </div>

        {/* KPIs - Segunda Linha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Reservas Confirmadas */}
          <Card className="border-l-4 border-l-blue-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reservas Confirmadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dados?.reservasConfirmadas || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Próximos dias</p>
            </div>
          </Card>

          {/* Produtos Baixo Estoque */}
          <Card className="border-l-4 border-l-red-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Produtos em Falta</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {dados?.produtosBaixoEstoque || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Baixo estoque</p>
            </div>
          </Card>

          {/* Comandas Aguardando */}
          <Card className="border-l-4 border-l-yellow-600">
            <div>
              <p className="text-gray-600 text-sm font-medium">Comandas Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {dados?.comandasAguardando || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Aguardando pagamento</p>
            </div>
          </Card>
        </div>

        {/* Próximas Reservas */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Próximas Reservas</h3>
          {dados?.proximasReservas?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma reserva próxima</p>
          ) : (
            <div className="space-y-3">
              {dados?.proximasReservas?.map((reserva, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {reserva.cliente} - {reserva.quadra}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatarData(reserva.dataReserva)} às {formatarHora(reserva.horarioInicio)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{reserva.duracao} min</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
          {dados?.produtosMaisVendidos?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum produto vendido</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Produto</th>
                    <th className="px-4 py-2 text-left">Categoria</th>
                    <th className="px-4 py-2 text-right">Quantidade</th>
                    <th className="px-4 py-2 text-right">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {dados?.produtosMaisVendidos?.map((produto, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{produto.nome}</td>
                      <td className="px-4 py-2">{produto.categoria}</td>
                      <td className="px-4 py-2 text-right">{produto.quantidadeVendida}</td>
                      <td className="px-4 py-2 text-right text-green-600 font-medium">
                        {formatarMoeda(produto.receita)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default DashboardAdmin;
