import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usuariosAPI } from '../services/api';
import { Button, Input, Card, Alert, Loading } from '../components/UI';

const Perfil = () => {
  const navigate = useNavigate();
  const { atualizarUsuario } = useAuth();
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
  const [mostrarTrocaSenha, setMostrarTrocaSenha] = useState(false);
  const [senhaForm, setSenhaForm] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const response = await usuariosAPI.obterPerfil();
      setFormData({
        nome: response.data.nome || '',
        email: response.data.email || '',
        telefone: response.data.telefone || '',
        cpf: response.data.cpf || ''
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

      if (response.data.usuario) {
        setSucesso('Perfil atualizado com sucesso!');
        addToast('Perfil atualizado com sucesso!', 'success');
        setModo('visualizar');
        atualizarUsuario({ nome: response.data.usuario.nome, telefone: response.data.usuario.telefone });
        // Atualizar dados locais
        setFormData(prev => ({
          ...prev,
          nome: response.data.usuario.nome,
          telefone: response.data.usuario.telefone
        }));
      } else {
        setErro(response.data.erro || response.data.mensagem || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      const mensagemErro = 
        error.response?.data?.erro ||
        error.response?.data?.mensagem ||
        'Erro ao atualizar perfil. Tente novamente.';
      setErro(mensagemErro);
      addToast(mensagemErro, 'error');
    } finally {
      setSalvando(false);
    }
  };

  const alterarSenha = async event => {
    event.preventDefault();
    setErroSenha('');
    setSucessoSenha('');
    if (senhaForm.novaSenha.length < 6) { setErroSenha('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) { setErroSenha('A confirmação da nova senha não confere.'); return; }
    setSalvandoSenha(true);
    try {
      const { data } = await usuariosAPI.alterarSenha(senhaForm);
      setSucessoSenha(data.mensagem || 'Senha alterada com sucesso.');
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setMostrarTrocaSenha(false);
      addToast(data.mensagem || 'Senha alterada com sucesso.', 'success');
    } catch (error) {
      const message = error.response?.data?.erro || 'Não foi possível alterar a senha. Tente novamente.';
      setErroSenha(message);
      addToast(message, 'error');
    } finally { setSalvandoSenha(false); }
  };

  if (carregando) return <Loading />;

  return (
    <section className="profile-page">
        <div className="page-heading"><div><span className="page-eyebrow">SUA CONTA</span><h1>Meu perfil</h1><p>Gerencie seus dados e mantenha sua conta protegida.</p></div><Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar ao painel</Button></div>
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
        <Card className="profile-security-card mt-8">
          <h2 className="text-lg font-semibold mb-4">Segurança</h2>
          <p className="text-gray-600 mb-4">
            Troque sua senha periodicamente e não a compartilhe com outras pessoas.
          </p>
          {sucessoSenha && <Alert type="success" message={sucessoSenha} />}
          {erroSenha && <Alert type="error" message={erroSenha} onClose={() => setErroSenha('')} />}
          {!mostrarTrocaSenha ? <Button variant="secondary" onClick={() => { setMostrarTrocaSenha(true); setSucessoSenha(''); }}>Alterar senha</Button> : <form className="password-change-form" onSubmit={alterarSenha}>
            <Input label="Senha atual" type="password" required autoComplete="current-password" value={senhaForm.senhaAtual} onChange={event => setSenhaForm({ ...senhaForm, senhaAtual: event.target.value })} disabled={salvandoSenha} />
            <Input label="Nova senha" type="password" required minLength={6} autoComplete="new-password" placeholder="Mínimo de 6 caracteres" value={senhaForm.novaSenha} onChange={event => setSenhaForm({ ...senhaForm, novaSenha: event.target.value })} disabled={salvandoSenha} />
            <Input label="Confirmar nova senha" type="password" required minLength={6} autoComplete="new-password" value={senhaForm.confirmarSenha} onChange={event => setSenhaForm({ ...senhaForm, confirmarSenha: event.target.value })} disabled={salvandoSenha} />
            <div className="flex gap-3"><Button type="submit" disabled={salvandoSenha}>{salvandoSenha ? 'Atualizando...' : 'Salvar nova senha'}</Button><Button type="button" variant="secondary" disabled={salvandoSenha} onClick={() => { setMostrarTrocaSenha(false); setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' }); setErroSenha(''); }}>Cancelar</Button></div>
          </form>}
        </Card>
    </section>
  );
};

export default Perfil;
