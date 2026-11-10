-- Preload the Arena Kona demo venue and two independently bookable sand courts.
-- Attach the venue to an existing active administrator so no fabricated owner account is created.
INSERT INTO `estabelecimentos` (`id`, `nome`, `endereco`, `contato`, `ativo`, `proprietarioId`, `dataCriacao`, `dataAtualizacao`)
SELECT 'arenago-kona-demo', 'Arena Kona', 'Centro, Conchal - SP', 'Contato não informado', true, `u`.`id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `usuarios` AS `u`
WHERE `u`.`perfil` = 'ADMIN' AND `u`.`ativo` = true
  AND NOT EXISTS (SELECT 1 FROM `estabelecimentos` WHERE `id` = 'arenago-kona-demo')
ORDER BY `u`.`dataCriacao` ASC
LIMIT 1;

INSERT INTO `quadras` (`id`, `nome`, `tipo`, `descricao`, `tamanho`, `capacidade`, `precoHora`, `horarioInicio`, `horarioFim`, `durationPadraoMinutos`, `ativa`, `dataCriacao`, `dataAtualizacao`, `estabelecimentoId`)
SELECT 'arenago-kona-court-1', 'Quadra 1', 'BEACH_TENNIS', 'Quadra de Beach Tennis da Arena Kona', NULL, 4, 20.00, '06:00', '22:00', 60, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), 'arenago-kona-demo'
FROM `estabelecimentos` AS `e`
WHERE `e`.`id` = 'arenago-kona-demo' AND `e`.`ativo` = true
  AND NOT EXISTS (SELECT 1 FROM `quadras` WHERE `id` = 'arenago-kona-court-1');

INSERT INTO `quadras` (`id`, `nome`, `tipo`, `descricao`, `tamanho`, `capacidade`, `precoHora`, `horarioInicio`, `horarioFim`, `durationPadraoMinutos`, `ativa`, `dataCriacao`, `dataAtualizacao`, `estabelecimentoId`)
SELECT 'arenago-kona-court-2', 'Quadra 2', 'BEACH_TENNIS', 'Quadra de Beach Tennis da Arena Kona', NULL, 4, 20.00, '06:00', '22:00', 60, true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3), 'arenago-kona-demo'
FROM `estabelecimentos` AS `e`
WHERE `e`.`id` = 'arenago-kona-demo' AND `e`.`ativo` = true
  AND NOT EXISTS (SELECT 1 FROM `quadras` WHERE `id` = 'arenago-kona-court-2');
