import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Alert, Loading, Card } from '../components/UI';

const Login = () => {
  const navigate = useNavigate();
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

      if (response.data.success) {
        login(response.data.usuario, response.data.token);
        setSucesso('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setErro(response.data.mensagem || 'Erro ao fazer login');
      }
    } catch (error) {
      const mensagemErro = 
        error.response?.data?.mensagem ||
        error.response?.data?.error ||
        'Erro ao conectar com o servidor. Verifique suas credenciais.';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando && sucesso) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">AG</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ArenaGo</h1>
            <p className="text-gray-600 text-sm">Gerenciamento de Quadras Esportivas</p>
          </div>

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
            <div>
              <Link
                to="/recuperar-senha"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="border-t pt-3">
              <p className="text-gray-600 text-sm mb-2">Não tem uma conta?</p>
              <Link
                to="/cadastro"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Criar Conta
              </Link>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-gray-600">
              <strong>Demo:</strong> Use qualquer email e senha para testar
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
