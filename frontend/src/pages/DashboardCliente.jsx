import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservasAPI } from '../services/api';
import { Button, Card, Alert, Loading, Table } from '../components/UI';

const DashboardCliente = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    try {
      const response = await reservasAPI.listar();
      setReservas(response.data.dados || []);
    } catch (error) {
      setErro('Erro ao carregar reservas');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  const getStatusBadge = (status) => {
    const cores = {
      CONFIRMADA: 'bg-blue-100 text-blue-800',
      ATIVA: 'bg-green-100 text-green-800',
      FINALIZADA: 'bg-gray-100 text-gray-800',
      CANCELADA: 'bg-red-100 text-red-800'
    };
    return cores[status] || 'bg-gray-100 text-gray-800';
  };

  const proximasReservas = reservas
    .filter(r => r.status !== 'CANCELADA')
    .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva))
    .slice(0, 5);

  const historicoReservas = reservas
    .slice()
    .reverse()
    .slice(0, 10);

  if (carregando) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ArenaGo</h1>
            <p className="text-gray-600">Bem-vindo, {usuario?.nome}!</p>
          </div>
          <div className="space-x-3">
            <Link to="/perfil">
              <Button variant="secondary">Perfil</Button>
            </Link>
            <Button variant="danger" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao ArenaGo!</h2>
              <p className="mb-4">Gerencie suas reservas de quadras esportivas</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/nova-reserva')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              + Nova Reserva
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Próximas Reservas */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Próximas Reservas</h3>
            {proximasReservas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma reserva próxima</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/nova-reserva')}
                >
                  Fazer Reserva
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximasReservas.map(reserva => (
                  <div key={reserva.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {reserva.quadra?.nome || 'Quadra'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatarData(reserva.dataReserva)} às {formatarHora(reserva.horarioInicio)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duração: {reserva.duracao} minutos
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reserva.status)}`}>
                        {reserva.status}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/reserva/${reserva.id}`}>
                        <Button variant="secondary" size="sm">
                          Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Estatísticas Rápidas */}
          <div className="space-y-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Total de Reservas</p>
                <p className="text-4xl font-bold text-blue-600">{reservas.length}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Reservas Ativas</p>
                <p className="text-4xl font-bold text-green-600">
                  {reservas.filter(r => r.status === 'CONFIRMADA' || r.status === 'ATIVA').length}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-600 mb-2">Dica</p>
                <p className="text-sm text-gray-700">
                  Você pode cancelar suas reservas com até 2 horas de antecedência
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Histórico de Reservas */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Histórico de Reservas</h3>
          {historicoReservas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma reserva encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Quadra</th>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Horário</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoReservas.map(reserva => (
                    <tr key={reserva.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{reserva.quadra?.nome || 'Quadra'}</td>
                      <td className="px-4 py-2">{formatarData(reserva.dataReserva)}</td>
                      <td className="px-4 py-2">{formatarHora(reserva.horarioInicio)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(reserva.status)}`}>
                          {reserva.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Link to={`/reserva/${reserva.id}`}>
                          <Button variant="secondary" size="sm">
                            Ver
                          </Button>
                        </Link>
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

export default DashboardCliente;
