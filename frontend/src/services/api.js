import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTENTICAÇÃO ====================

export const authAPI = {
  registro: (dados) => api.post('/auth/registro', dados),
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  recuperarSenha: (email) => api.post('/auth/recuperar-senha', { email }),
  redefinirSenha: (token, novaSenha) => api.post('/auth/redefinir-senha', { token, novaSenha })
};

// ==================== USUÁRIOS ====================

export const usuariosAPI = {
  obterPerfil: () => api.get('/usuarios/perfil'),
  atualizarPerfil: (dados) => api.put('/usuarios/perfil', dados),
  listar: (params) => api.get('/usuarios', { params }),
  obter: (id) => api.get(`/usuarios/${id}`),
  criar: (dados) => api.post('/usuarios', dados),
  atualizar: (id, dados) => api.put(`/usuarios/${id}`, dados),
  deletar: (id) => api.delete(`/usuarios/${id}`)
};

// ==================== QUADRAS ====================

export const quadrasAPI = {
  listar: (params) => api.get('/quadras', { params }),
  obter: (id) => api.get(`/quadras/${id}`),
  criar: (dados) => api.post('/quadras', dados),
  atualizar: (id, dados) => api.put(`/quadras/${id}`, dados),
  deletar: (id) => api.delete(`/quadras/${id}`)
};

// ==================== DISPONIBILIDADE ====================

export const disponibilidadeAPI = {
  obter: (quadraId, params) => api.get(`/disponibilidade/quadras/${quadraId}`, { params })
};

// ==================== RESERVAS ====================

export const reservasAPI = {
  listar: (params) => api.get('/reservas', { params }),
  obter: (id) => api.get(`/reservas/${id}`),
  criar: (dados) => api.post('/reservas', dados),
  atualizar: (id, dados) => api.put(`/reservas/${id}`, dados),
  cancelar: (id, motivo) => api.delete(`/reservas/${id}`, { data: { motivo } })
};

// ==================== COMANDAS ====================

export const comandasAPI = {
  listar: (params) => api.get('/comandas', { params }),
  obter: (id) => api.get(`/comandas/${id}`),
  adicionarItem: (id, dados) => api.post(`/comandas/${id}/itens`, dados),
  removerItem: (id, itemId) => api.delete(`/comandas/${id}/itens/${itemId}`),
  fechar: (id) => api.put(`/comandas/${id}/fechar`),
  registrarPagamento: (id, dados) => api.post(`/comandas/${id}/pagamento`, dados)
};

// ==================== PRODUTOS ====================

export const produtosAPI = {
  listar: (params) => api.get('/produtos', { params }),
  obter: (id) => api.get(`/produtos/${id}`),
  criar: (dados) => api.post('/produtos', dados),
  atualizar: (id, dados) => api.put(`/produtos/${id}`, dados),
  deletar: (id) => api.delete(`/produtos/${id}`)
};

// ==================== CATEGORIAS ====================

export const categoriasAPI = {
  listar: () => api.get('/categorias'),
  criar: (dados) => api.post('/categorias', dados),
  atualizar: (id, dados) => api.put(`/categorias/${id}`, dados),
  deletar: (id) => api.delete(`/categorias/${id}`)
};

// ==================== DASHBOARD ====================

export const dashboardAPI = {
  obter: () => api.get('/dashboard')
};

// ==================== BLOQUEIOS ====================

export const bloqueiosAPI = {
  listar: (params) => api.get('/bloqueios', { params }),
  criar: (dados) => api.post('/bloqueios', dados),
  deletar: (id) => api.delete(`/bloqueios/${id}`)
};

export default api;
