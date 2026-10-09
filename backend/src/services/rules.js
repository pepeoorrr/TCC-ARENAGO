const { ensure } = require('./errors');
function integer(value, name, min = 1) {
  const n = Number(value);
  ensure(value !== '' && value != null && Number.isSafeInteger(n) && n >= min, `${name} inválido`);
  return n;
}
function cents(value) {
  ensure(value !== '' && value != null && /^\d+(\.\d{1,2})?$/.test(String(value)), 'Valor monetário inválido');
  const [whole, fraction = ''] = String(value).split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  ensure(Number.isSafeInteger(result) && result <= 9999999999, 'Valor monetário inválido');
  return result;
}
const money = value => (value / 100).toFixed(2);
function time(value) {
  ensure(typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value), 'Horário inválido');
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
}
function date(value) {
  ensure(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), 'Data inválida');
  const result = new Date(`${value}T00:00:00.000Z`);
  ensure(!Number.isNaN(result.getTime()) && result.toISOString().slice(0, 10) === value, 'Data inválida');
  return result;
}
function booking(quadra, input, now) {
  const dataReserva = date(input.data);
  const start = time(input.horarioInicio);
  const duration = integer(input.duracao, 'Duração');
  const end = start + duration;
  ensure(start >= time(quadra.horarioInicio) && end <= time(quadra.horarioFim), 'Horário fora do funcionamento da quadra');
  const instant = new Date(`${input.data}T${input.horarioInicio}:00-03:00`);
  ensure(instant > now, 'A reserva deve ser futura');
  return { dataReserva, horarioInicio: input.horarioInicio,
    horarioFim: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
    valorAluguel: money(Math.round(cents(quadra.precoHora) * duration / 60)) };
}
function itemRules(comanda, produto, quantidade) {
  ensure(comanda.status === 'ABERTA', 'Comanda não está aberta');
  ensure(produto && produto.ativo, 'Produto não encontrado ou inativo');
  ensure(produto.estabelecimentoId === comanda.reserva.quadra.estabelecimentoId, 'Produto de outro estabelecimento');
  const count = integer(quantidade, 'Quantidade');
  ensure(produto.estoqueAtual >= count, 'Estoque insuficiente');
  return { quantidade: count, precoUnitario: money(cents(produto.preco)), subtotal: money(cents(produto.preco) * count) };
}
function payment(comanda, body) {
  ensure(comanda.status === 'AGUARDANDO_PAGAMENTO', 'Comanda não está aguardando pagamento');
  ensure(['DINHEIRO', 'PIX', 'CARTAO'].includes(body.formaPagamento), 'Forma de pagamento inválida');
  const total = cents(comanda.total);
  const paid = body.valorPago == null ? total : cents(body.valorPago);
  ensure(paid >= total, 'Valor pago insuficiente');
  ensure(body.formaPagamento === 'DINHEIRO' || paid === total, 'Troco permitido somente em dinheiro');
  return { formaPagamento: body.formaPagamento, valorPago: money(paid), troco: money(paid - total) };
}
function cancellable(comandas) {
  ensure(comandas.every(c => c.status !== 'PAGA' && c.itens.length === 0), 'Não é possível cancelar cobrança com consumo ou pagamento');
}
const settled = comandas => comandas.length > 0 && comandas.some(c => c.status === 'PAGA') && comandas.every(c => ['PAGA', 'CANCELADA'].includes(c.status));
module.exports = { integer, cents, money, time, date, booking, itemRules, payment, cancellable, settled };
