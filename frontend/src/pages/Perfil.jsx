import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usuariosAPI } from '../services/api';
import { Button, Input, Card, Alert, Loading } from '../components/UI';

const Perfil = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erros, setErros] = useState({});
  const [modo, setModo] = useState('visualizar'); // visualizar ou editar

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const response = await usuariosAPI.obterPerfil();
      setFormData({
        nome: response.data.dados.nome || '',
        email: response.data.dados.email || '',
        telefone: response.data.dados.telefone || '',
        cpf: response.data.dados.cpf || ''
      });
    } catch (error) {
      setErro('Erro ao carregar perfil');
      console.error(error);
    } finally {
      setCarregando(false);
    }
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

    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formData.telefone)) {
      novosErros.telefone = 'Telefone inválido (10 ou 11 dígitos)';
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

    setSalvando(true);

    try {
      const response = await usuariosAPI.atualizarPerfil({
        nome: formData.nome.trim(),
        telefone: formData.telefone.replace(/[^\d]/g, '')
      });

      if (response.data.success) {
        setSucesso('Perfil atualizado com sucesso!');
        addToast('Perfil atualizado com sucesso!', 'success');
        setModo('visualizar');
        // Atualizar dados locais
        setFormData(prev => ({
          ...prev,
          nome: response.data.dados.nome,
          telefone: response.data.dados.telefone
        }));
      } else {
        setErro(response.data.mensagem || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      const mensagemErro = 
        error.response?.data?.mensagem ||
        error.response?.data?.error ||
        'Erro ao atualizar perfil. Tente novamente.';
      setErro(mensagemErro);
      addToast(mensagemErro, 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <div className="space-x-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Voltar
            </Button>
            <Button variant="danger" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        {sucesso && <Alert type="success" message={sucesso} />}

        <Card>
          {/* Info Básica */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-lg font-semibold mb-4">Informações da Conta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="px-4 py-2 bg-gray-100 rounded text-gray-700">
                  {formData.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">Não pode ser alterado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <p className="px-4 py-2 bg-gray-100 rounded text-gray-700">
                  {formData.cpf}
                </p>
                <p className="text-xs text-gray-500 mt-1">Não pode ser alterado</p>
              </div>
            </div>
          </div>

          {/* Dados Editáveis */}
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold mb-4">Dados Pessoais</h2>

            <Input
              label="Nome Completo"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              error={erros.nome}
              disabled={modo === 'visualizar' || salvando}
              required
            />

            <Input
              label="Telefone"
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 98765-4321"
              error={erros.telefone}
              disabled={modo === 'visualizar' || salvando}
              required
            />

            {/* Botões de Ação */}
            <div className="flex gap-3 mt-6">
              {modo === 'visualizar' ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setModo('editar')}
                  >
                    Editar Perfil
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Voltar ao Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setModo('visualizar');
                      carregarPerfil();
                      setErro('');
                    }}
                    disabled={salvando}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>

        {/* Seção de Segurança */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Segurança</h2>
          <p className="text-gray-600 mb-4">
            Altere sua senha para manter sua conta segura.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/alterar-senha')}
          >
            Alterar Senha
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Perfil;
