const { test } = require('node:test');
const assert = require('node:assert/strict');
const r = require('../../src/services/rules');
test('valores monetários usam centavos e não concatenam decimais', () => {
  assert.equal(r.cents('10.10') + r.cents('0.20'), 1030);
  assert.equal(r.money(1030), '10.30');
  for (const value of [-1, NaN, Infinity, '', null, '1.234', 'abc']) assert.throws(() => r.cents(value));
});
test('quantidades exigem inteiros positivos', () => {
  for (const value of [0, -1, 1.5, '', null, NaN]) assert.throws(() => r.integer(value, 'Quantidade'));
  assert.equal(r.integer('2', 'Quantidade'), 2);
});
test('aluguel proporcional à duração e horários válidos', () => {
  const quadra = { precoHora: '90.00', horarioInicio: '06:00', horarioFim: '22:00' };
  const input = { data: '2030-02-01', horarioInicio: '19:00', duracao: 90 };
  const result = r.booking(quadra, input, new Date('2030-01-01'));
  assert.equal(result.valorAluguel, '135.00'); assert.equal(result.horarioFim, '20:30');
  assert.throws(() => r.booking(quadra, { ...input, duracao: 240 }, new Date('2030-01-01')));
  assert.throws(() => r.booking(quadra, input, new Date('2031-01-01')));
  assert.throws(() => r.date('2030-02-30'));
});
test('consumo exige mesmo local, estoque e comanda aberta', () => {
  const comanda = { status: 'ABERTA', reserva: { quadra: { estabelecimentoId: 'a' } } };
  const produto = { ativo: true, estabelecimentoId: 'a', estoqueAtual: 3, preco: '4.50' };
  assert.deepEqual(r.itemRules(comanda, produto, 2), { quantidade: 2, precoUnitario: '4.50', subtotal: '9.00' });
  assert.throws(() => r.itemRules(comanda, { ...produto, estabelecimentoId: 'b' }, 1));
  assert.throws(() => r.itemRules(comanda, produto, 4));
  assert.throws(() => r.itemRules({ ...comanda, status: 'PAGA' }, produto, 1));
  assert.throws(() => r.itemRules(comanda, { ...produto, ativo: false }, 1));
});
test('pagamento valida situação, valor e calcula troco no servidor', () => {
  const comanda = { status: 'AGUARDANDO_PAGAMENTO', total: '10.10' };
  assert.deepEqual(r.payment(comanda, { formaPagamento: 'DINHEIRO', valorPago: '20.00', troco: '1000.00' }), { formaPagamento: 'DINHEIRO', valorPago: '20.00', troco: '9.90' });
  assert.throws(() => r.payment(comanda, { formaPagamento: 'PIX', valorPago: '20.00' }));
  assert.throws(() => r.payment(comanda, { formaPagamento: 'DINHEIRO', valorPago: '1.00' }));
  assert.throws(() => r.payment({ ...comanda, status: 'PAGA' }, { formaPagamento: 'PIX' }));
});
test('cancelamento protege consumo e pagamento; finalização exige todas as cobranças resolvidas', () => {
  r.cancellable([{ status: 'ABERTA', itens: [] }]);
  assert.throws(() => r.cancellable([{ status: 'PAGA', itens: [] }]));
  assert.throws(() => r.cancellable([{ status: 'ABERTA', itens: [{}] }]));
  assert.equal(r.settled([{ status: 'PAGA' }, { status: 'ABERTA' }]), false);
  assert.equal(r.settled([{ status: 'PAGA' }, { status: 'PAGA' }, { status: 'CANCELADA' }]), true);
  assert.equal(r.settled([]), false);
});
