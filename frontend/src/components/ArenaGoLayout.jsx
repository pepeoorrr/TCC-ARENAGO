import { useState } from 'react';

export default function ArenaGoLayout() {
  const [cidade, setCidade] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [data, setData] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [reservas, setReservas] = useState([]);

  const adicionarFavorito = (nomeQuadra) => {
    if (favoritos.includes(nomeQuadra)) {
      setFavoritos(favoritos.filter((item) => item !== nomeQuadra));
    } else {
      setFavoritos([...favoritos, nomeQuadra]);
    }
  };

  const realizarReserva = (quadra) => {
    const novaReserva = {
      quadra: quadra.nome,
      horario: '19:00 - 20:00',
      data: data || 'Data não selecionada'
    };

    setReservas([...reservas, novaReserva]);

    alert(`Reserva realizada com sucesso em ${quadra.nome}`);
  };
  const quadras = [
    {
      nome: 'Arena Beach Center',
      cidade: 'Araras - SP',
      preco: 'R$ 80/h',
      esporte: 'Futevôlei • Vôlei de Areia'
    },
    {
      nome: 'Sunset Arena',
      cidade: 'Limeira - SP',
      preco: 'R$ 65/h',
      esporte: 'Beach Tennis • Vôlei'
    },
    {
      nome: 'Arena Gold Sand',
      cidade: 'Piracicaba - SP',
      preco: 'R$ 95/h',
      esporte: 'Futevôlei • Beach Tennis'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      {/* HEADER */}
      <header className="bg-black text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">ArenaGo</h1>
          <p className="text-sm text-zinc-300">
            Agendamento de quadras esportivas
          </p>
        </div>

        <nav className="flex gap-4 items-center">
          <button className="bg-zinc-800 px-5 py-2 rounded-xl hover:bg-zinc-700 transition">
            Entrar
          </button>

          <button className="bg-yellow-500 text-black px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
            Criar Conta
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative h-[500px] bg-gradient-to-r from-black via-zinc-900 to-yellow-700 text-white flex items-center px-12 overflow-hidden">
        <div className="max-w-2xl z-10">
          <h2 className="text-6xl font-extrabold leading-tight mb-6">
            Reserve sua quadra de areia em segundos
          </h2>

          <p className="text-lg text-zinc-200 mb-8">
            Encontre arenas esportivas, escolha horários disponíveis e faça pagamentos direto pela plataforma.
          </p>

          <div className="bg-white rounded-3xl p-5 flex flex-wrap gap-4 shadow-2xl text-black">
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="flex-1 min-w-[150px] border p-3 rounded-xl"
            />

            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="flex-1 min-w-[150px] border p-3 rounded-xl"
            >
              <option>Modalidade</option>
              <option>Futevôlei</option>
              <option>Beach Tennis</option>
              <option>Vôlei de Areia</option>
            </select>

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="flex-1 min-w-[150px] border p-3 rounded-xl"
            />

            <button className="bg-yellow-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition">
              Buscar Quadras
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-[40%] bg-white/10 blur-3xl"></div>
      </section>

      {/* DESTAQUES */}
      <section className="px-10 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-4xl font-bold">Quadras em destaque</h3>
            <p className="text-zinc-600 mt-2">
              Escolha a melhor arena para sua partida
            </p>
          </div>

          <button className="bg-black text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition">
            Ver Todas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {quadras.map((quadra, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
            >
              <div className="h-56 bg-gradient-to-br from-yellow-400 to-orange-500"></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-bold">{quadra.nome}</h4>
                    <p className="text-zinc-500">{quadra.cidade}</p>
                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Disponível
                  </span>
                </div>

                <p className="text-zinc-600 mb-4">{quadra.esporte}</p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-zinc-500">A partir de</p>
                    <h5 className="text-3xl font-bold text-yellow-600">
                      {quadra.preco}
                    </h5>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => adicionarFavorito(quadra.nome)}
                      className="border border-zinc-300 px-4 py-3 rounded-xl hover:bg-zinc-100 transition"
                    >
                      {favoritos.includes(quadra.nome) ? '★' : '☆'}
                    </button>

                    <button
                      onClick={() => realizarReserva(quadra)}
                      className="bg-black text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="bg-black text-white px-10 py-16">
        <div className="text-center mb-14">
          <h3 className="text-4xl font-bold mb-4">
            Funcionalidades do Sistema
          </h3>

          <p className="text-zinc-400 max-w-3xl mx-auto">
            Plataforma moderna com recursos completos para usuários e administradores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            'Login e Cadastro',
            'Pagamento Integrado',
            'Controle de Horários',
            'Histórico de Reservas',
            'Comanda Individual',
            'Venda de Produtos',
            'Relatórios Administrativos',
            'Bloqueio Automático'
          ].map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500 transition"
            >
              <h4 className="text-xl font-semibold mb-3">{item}</h4>

              <p className="text-zinc-400 text-sm">
                Sistema otimizado para gerenciamento inteligente das quadras.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="px-10 py-16">
        <div className="mb-10">
          <h3 className="text-4xl font-bold mb-3">
            Painel Administrativo
          </h3>

          <p className="text-zinc-600">
            Controle total das reservas, horários e faturamento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[
            ['Reservas do Dia', '48'],
            ['Faturamento', 'R$ 6.420'],
            ['Quadras Ativas', '12'],
            ['Usuários Online', '87']
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <p className="text-zinc-500 mb-2">{card[0]}</p>
              <h4 className="text-4xl font-bold">{card[1]}</h4>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h4 className="text-2xl font-bold mb-6">
            Controle de Agendamentos
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4">Usuário</th>
                  <th className="text-left py-4">Quadra</th>
                  <th className="text-left py-4">Horário</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-left py-4">Pagamento</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b hover:bg-zinc-50">
                  <td className="py-4">Pedro Ramalho</td>
                  <td>Arena Beach Center</td>
                  <td>19:00 - 20:30</td>
                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Confirmado
                    </span>
                  </td>
                  <td>PIX</td>
                </tr>

                <tr className="border-b hover:bg-zinc-50">
                  <td className="py-4">Guilherme Vischi</td>
                  <td>Sunset Arena</td>
                  <td>21:00 - 22:00</td>
                  <td>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Pendente
                    </span>
                  </td>
                  <td>Cartão</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HISTÓRICO DE RESERVAS */}
      <section className="px-10 py-16 bg-zinc-100">
        <div className="mb-10">
          <h3 className="text-4xl font-bold mb-3">
            Histórico de Reservas
          </h3>

          <p className="text-zinc-600">
            Visualize todas as reservas realizadas na plataforma.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {reservas.length === 0 ? (
            <p className="text-zinc-500">
              Nenhuma reserva realizada até o momento.
            </p>
          ) : (
            <div className="space-y-4">
              {reservas.map((reserva, index) => (
                <div
                  key={index}
                  className="border border-zinc-200 rounded-2xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-xl font-bold">{reserva.quadra}</h4>
                    <p className="text-zinc-500">{reserva.data}</p>
                  </div>

                  <div>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {reserva.horario}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white px-10 py-10 mt-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <h4 className="text-3xl font-bold mb-3">ArenaGo</h4>
            <p className="text-zinc-400 max-w-md">
              Plataforma profissional para gerenciamento e agendamento de quadras esportivas de areia.
            </p>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Recursos</h5>
            <ul className="space-y-2 text-zinc-400">
              <li>Reservas Online</li>
              <li>Pagamento Integrado</li>
              <li>Histórico de Jogos</li>
              <li>Painel Administrativo</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Contato</h5>
            <ul className="space-y-2 text-zinc-400">
              <li>suporte@arenago.com</li>
              <li>(19) 99999-9999</li>
              <li>Araras - SP</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
