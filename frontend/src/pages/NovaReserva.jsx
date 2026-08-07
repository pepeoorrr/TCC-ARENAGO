import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quadrasAPI } from '../services/api';
import { Button, Card, Alert, Loading, Input } from '../components/UI';

const NovaReserva = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarQuadras();
  }, []);

  const carregarQuadras = async () => {
    try {
      const response = await quadrasAPI.listar();
      setQuadras(response.data.dados || []);
    } catch (error) {
      setErro('Erro ao carregar quadras');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      FUTSAL: '⚽',
      VOLEI: '🏐',
      BASQUETE: '🏀',
      TENIS: '🎾',
      OUTRO: '🏐'
    };
    return icons[tipo] || '🏐';
  };

  const quadrasFiltradas = quadras.filter(q =>
    q.ativa &&
    (q.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
     q.tipo?.toLowerCase().includes(filtro.toLowerCase()))
  );

  if (carregando) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Reserva</h1>
            <p className="text-gray-600">Selecione a quadra</p>
          </div>
          <div className="space-x-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard/cliente')}>
              Voltar
            </Button>
            <Button variant="danger" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

        {/* Filtro */}
        <Card className="mb-8">
          <Input
            placeholder="Buscar quadra..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </Card>

        {/* Quadras Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quadrasFiltradas.length === 0 ? (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {quadras.length === 0 ? 'Nenhuma quadra disponível' : 'Nenhuma quadra encontrada'}
                </p>
                <Button variant="secondary" onClick={() => navigate('/dashboard/cliente')}>
                  Voltar ao Dashboard
                </Button>
              </Card>
            </div>
          ) : (
            quadrasFiltradas.map(quadra => (
              <Card key={quadra.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="mb-4">
                  <div className="text-4xl mb-2">{getTipoIcon(quadra.tipo)}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{quadra.nome}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Tipo:</strong> {quadra.tipo}</p>
                    <p><strong>Duração padrão:</strong> {quadra.durationPadraoMinutos} minutos</p>
                    <p><strong>Horário:</strong> {quadra.horarioInicio} - {quadra.horarioFim}</p>
                    <p className="text-lg font-semibold text-green-600 mt-3">
                      {formatarMoeda(quadra.precoHora)} por hora
                    </p>
                  </div>

                  {quadra.descricao && (
                    <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                      {quadra.descricao}
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/reserva/nova?quadraId=${quadra.id}`)}
                >
                  Selecionar Quadra
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NovaReserva;
