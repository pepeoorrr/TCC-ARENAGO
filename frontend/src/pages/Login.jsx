import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Alert, Loading, Card } from '../components/UI';
import Brand from '../components/Brand';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, estaAutenticado } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});

  // Redireciona se já está autenticado
  React.useEffect(() => {
    if (estaAutenticado()) {
      navigate('/dashboard');
    }
  }, [estaAutenticado, navigate]);

  const validar = () => {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido';
    }

    if (!senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (senha.length < 6) {
      novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!validar()) {
      return;
    }

    setCarregando(true);

    try {
      const response = await authAPI.login({
        email: email.toLowerCase().trim(),
        senha
      });

      if (response.data.usuario && response.data.token) {
        login(response.data.usuario, response.data.token);
        setSucesso('Login realizado com sucesso!');
        const prefillBooking = location.state?.prefillBooking || location.state?.from?.state?.prefillBooking;
        const destination = location.state?.from?.pathname || (prefillBooking ? '/nova-reserva' : '/dashboard');
        navigate(destination, { replace: true, state: prefillBooking ? { prefillBooking } : location.state?.from?.state });
      } else {
        setErro(response.data.erro || response.data.mensagem || 'Erro ao fazer login');
      }
    } catch (error) {
      const mensagemErro = 
        error.response?.data?.erro ||
        error.response?.data?.mensagem ||
        (error.request ? 'Não foi possível conectar à ArenaGo. Confira se a API está em execução e tente novamente.' : 'Não foi possível entrar. Verifique os dados e tente novamente.');
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando && sucesso) {
    return <Loading />;
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-home-link">← Voltar para o início</Link>
      <div className="auth-card-wrap">
        <Card className="auth-card">
          {/* Header */}
          <div className="text-center mb-8">
            <Brand />
            <h1 className="auth-title">Entre na ArenaGo</h1>
            <p className="text-gray-600 text-sm">Bom jogo começa com uma boa reserva.</p>
          </div>
          <p className="auth-subline">Entre na sua conta para organizar sua próxima partida.</p>

          {/* Alerts */}
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          {sucesso && <Alert type="success" message={sucesso} />}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (erros.email) setErros({ ...erros, email: '' });
              }}
              placeholder="seu.email@exemplo.com"
              error={erros.email}
              required
              disabled={carregando}
            />

            <Input
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erros.senha) setErros({ ...erros, senha: '' });
              }}
              placeholder="Sua senha"
              error={erros.senha}
              required
              disabled={carregando}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center">
            <div className="border-t pt-3">
              <p className="text-gray-600 text-sm mb-2">Não tem uma conta?</p>
              <Link
                to="/cadastro"
                state={location.state}
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Criar Conta
              </Link>
            </div>
          </div>

          {/* Demo Info */}
          <p className="auth-footnote">A plataforma usa sua conta para consultar reservas e horários disponíveis.</p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
