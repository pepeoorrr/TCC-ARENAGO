// Gerar número único de reserva
const gerarNumeroReserva = () => {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const aleatorio = Math.random().toString().slice(2, 6);
  return `RSV-${ano}${mes}${dia}-${aleatorio}`;
};

// Gerar número único de comanda
const gerarNumeroComanda = () => {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const aleatorio = Math.random().toString().slice(2, 6);
  return `CMD-${ano}${mes}${dia}-${aleatorio}`;
};

// Verificar se usuário tem permissão para uma ação
const temPermissao = (perfil, permissoes) => {
  return permissoes.includes(perfil);
};

// Formatar valor monetário
const formatarMoeda = (valor) => {
  return parseFloat(valor).toFixed(2);
};

// Validar horário
const validarHorario = (horario) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(horario);
};

module.exports = {
  gerarNumeroReserva,
  gerarNumeroComanda,
  temPermissao,
  formatarMoeda,
  validarHorario
};
