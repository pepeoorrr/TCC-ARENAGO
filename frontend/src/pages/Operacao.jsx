import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { comandasAPI, produtosAPI, quadrasAPI, reservasAPI, usuariosAPI } from '../services/api';
import { Alert, Button, Card, Loading } from '../components/UI';

const configuracoes = {
  '/gerenciamento/quadras': { titulo: 'Gerenciamento de Quadras', api: quadrasAPI.listar, campos: ['nome', 'tipo', 'precoHora'] },
  '/gerenciamento/produtos': { titulo: 'Gerenciamento de Produtos', api: produtosAPI.listar, campos: ['nome', 'preco', 'estoqueAtual'] },
  '/gerenciamento/usuarios': { titulo: 'Gerenciamento de Usuários', api: usuariosAPI.listar, campos: ['nome', 'email', 'perfil'] },
  '/agenda': { titulo: 'Agenda de Reservas', api: reservasAPI.listar, campos: ['numeroReserva', 'dataReserva', 'horarioInicio', 'status'] },
  '/dashboard/funcionario': { titulo: 'Agenda do Funcionário', api: reservasAPI.listar, campos: ['numeroReserva', 'dataReserva', 'horarioInicio', 'status'] },
  '/comanda': { titulo: 'Comandas', api: comandasAPI.listar, campos: ['numeroComanda', 'status', 'total'] }
};

const Operacao = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const chave = location.pathname;
  const configuracao = location.pathname.startsWith('/reserva/')
    ? { titulo: 'Detalhes da Reserva', api: () => reservasAPI.obter(location.pathname.split('/').pop()), campos: ['numeroReserva', 'dataReserva', 'horarioInicio', 'horarioFim', 'status'] }
    : location.pathname.startsWith('/comanda/')
      ? { titulo: 'Detalhes da Comanda', api: () => comandasAPI.obter(location.pathname.split('/').pop()), campos: ['numeroComanda', 'status', 'total', 'formaPagamento'] }
    : configuracoes[chave];

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await configuracao.api();
        const dados = response.data?.dados || response.data;
        setRegistros(Array.isArray(dados) ? dados : [dados]);
      } catch (error) {
        setErro(error.response?.data?.erro || 'Não foi possível carregar os dados');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [location.pathname]);

  if (carregando) return <Loading />;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
        <h1 className="text-3xl font-bold text-gray-900 my-6">{configuracao.titulo}</h1>
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        <Card>
          {registros.length === 0 ? <p className="text-gray-500">Nenhum registro encontrado.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>{configuracao.campos.map(campo => <th key={campo} className="text-left p-3 border-b">{campo}</th>)}</tr></thead>
                <tbody>{registros.map((registro, indice) => <tr key={registro.id || registro.numeroReserva || registro.numeroComanda || indice}>
                  {configuracao.campos.map(campo => <td key={campo} className="p-3 border-b">{String(registro[campo] ?? '-')}</td>)}
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Operacao;