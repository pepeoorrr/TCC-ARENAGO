import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Alert, Loading, Card } from '../components/UI';

const Cadastro = () => {
  const navigate = useNavigate();
  const { login, estaAutenticado } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    confirmarSenha: ''
  });
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

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/[^\d]/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
  };

  const validar = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formData.telefone)) {
      novosErros.telefone = 'Telefone inválido (10 ou 11 dígitos)';
    }

    if (!formData.cpf.trim()) {
      novosErros.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
      novosErros.cpf = 'CPF inválido';
    }

    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não conferem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
      const response = await authAPI.registro({
        nome: formData.nome.trim(),
        email: formData.email.toLowerCase().trim(),
        telefone: formData.telefone.replace(/[^\d]/g, ''),
        cpf: formData.cpf.replace(/[^\d]/g, ''),
        senha: formData.senha
      });

      if (response.data.success) {
        setSucesso('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          login(response.data.usuario, response.data.token);
          navigate('/dashboard');
        }, 1500);
      } else {
        setErro(response.data.mensagem || 'Erro ao criar conta');
      }
    } catch (error) {
      const mensagemErro = 
        error.response?.data?.mensagem ||
        error.response?.data?.error ||
        'Erro ao criar conta. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando && sucesso) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">AG</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ArenaGo</h1>
            <p className="text-gray-600 text-sm">Criar Nova Conta</p>
          </div>

          {/* Alerts */}
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          {sucesso && <Alert type="success" message={sucesso} />}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Input
              label="Nome Completo"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              error={erros.nome}
              required
              disabled={carregando}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              error={erros.email}
              required
              disabled={carregando}
            />

            <Input
              label="Telefone"
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 98765-4321"
              error={erros.telefone}
              required
              disabled={carregando}
            />

            <Input
              label="CPF"
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="123.456.789-10"
              error={erros.cpf}
              required
              disabled={carregando}
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              error={erros.senha}
              required
              disabled={carregando}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              placeholder="Repita sua senha"
              error={erros.confirmarSenha}
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
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Link */}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-gray-600 text-sm mb-2">Já tem uma conta?</p>
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              Voltar ao Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;
