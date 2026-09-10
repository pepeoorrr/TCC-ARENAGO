/*
  Warnings:

  - You are about to drop the `comanda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comanda_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quadra` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comanda` DROP FOREIGN KEY `comanda_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `comanda` DROP FOREIGN KEY `comanda_id_reserva_fkey`;

-- DropForeignKey
ALTER TABLE `comanda_item` DROP FOREIGN KEY `comanda_item_id_comanda_fkey`;

-- DropForeignKey
ALTER TABLE `comanda_item` DROP FOREIGN KEY `comanda_item_id_produto_fkey`;

-- DropForeignKey
ALTER TABLE `reserva` DROP FOREIGN KEY `reserva_id_cliente_fkey`;

-- DropForeignKey
ALTER TABLE `reserva` DROP FOREIGN KEY `reserva_id_quadra_fkey`;

-- DropTable
DROP TABLE `comanda`;

-- DropTable
DROP TABLE `comanda_item`;

-- DropTable
DROP TABLE `produto`;

-- DropTable
DROP TABLE `quadra`;

-- DropTable
DROP TABLE `reserva`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `perfil` ENUM('CLIENTE', 'FUNCIONARIO', 'ADMIN') NOT NULL DEFAULT 'CLIENTE',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quadras` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` ENUM('FUTSAL', 'VOLEI', 'BASQUETE', 'TENIS', 'OUTRO') NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tamanho` VARCHAR(191) NULL,
    `capacidade` INTEGER NOT NULL,
    `precoHora` DECIMAL(10, 2) NOT NULL,
    `horarioInicio` VARCHAR(191) NOT NULL,
    `horarioFim` VARCHAR(191) NOT NULL,
    `durationPadraoMinutos` INTEGER NOT NULL DEFAULT 60,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` VARCHAR(191) NOT NULL,
    `numeroReserva` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `quadraId` VARCHAR(191) NOT NULL,
    `dataReserva` DATETIME(3) NOT NULL,
    `horarioInicio` VARCHAR(191) NOT NULL,
    `horarioFim` VARCHAR(191) NOT NULL,
    `status` ENUM('CONFIRMADA', 'ATIVA', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
    `motivoCancelamento` VARCHAR(191) NULL,
    `canceladaPorId` VARCHAR(191) NULL,
    `valorAluguel` DECIMAL(10, 2) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reservas_numeroReserva_key`(`numeroReserva`),
    INDEX `reservas_usuarioId_idx`(`usuarioId`),
    INDEX `reservas_quadraId_idx`(`quadraId`),
    INDEX `reservas_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comandas` (
    `id` VARCHAR(191) NOT NULL,
    `numeroComanda` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `status` ENUM('ABERTA', 'FECHADA', 'AGUARDANDO_PAGAMENTO', 'PAGA', 'CANCELADA') NOT NULL DEFAULT 'ABERTA',
    `subtotalConsumos` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `valorAluguel` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `formaPagamento` VARCHAR(191) NULL,
    `valorPago` DECIMAL(10, 2) NULL,
    `troco` DECIMAL(10, 2) NULL,
    `observacoes` TEXT NULL,
    `dataFechamento` DATETIME(3) NULL,
    `dataPagamento` DATETIME(3) NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `comandas_numeroComanda_key`(`numeroComanda`),
    UNIQUE INDEX `comandas_reservaId_key`(`reservaId`),
    INDEX `comandas_usuarioId_idx`(`usuarioId`),
    INDEX `comandas_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_comanda` (
    `id` VARCHAR(191) NOT NULL,
    `comandaId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `precoUnitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `itens_comanda_comandaId_idx`(`comandaId`),
    INDEX `itens_comanda_produtoId_idx`(`produtoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `categoriaId` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `estoqueAtual` INTEGER NOT NULL,
    `estoqueMinimo` INTEGER NOT NULL DEFAULT 5,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    INDEX `produtos_categoriaId_idx`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categorias_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bloqueios` (
    `id` VARCHAR(191) NOT NULL,
    `quadraId` VARCHAR(191) NOT NULL,
    `dataBloqueio` DATETIME(3) NOT NULL,
    `horarioInicio` VARCHAR(191) NOT NULL,
    `horarioFim` VARCHAR(191) NOT NULL,
    `motivo` ENUM('MANUTENCAO', 'LIMPEZA', 'EVENTO', 'OUTRO') NOT NULL,
    `criadoPorId` VARCHAR(191) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bloqueios_quadraId_idx`(`quadraId`),
    INDEX `bloqueios_dataBloqueio_idx`(`dataBloqueio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tipoAcao` ENUM('CRIACAO', 'EDICAO', 'DELECAO', 'PAGAMENTO', 'CANCELAMENTO') NOT NULL,
    `entidade` VARCHAR(191) NOT NULL,
    `entidadeId` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `dadosAnteriores` LONGTEXT NULL,
    `dadosNovos` LONGTEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `dataAcao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historico_usuarioId_idx`(`usuarioId`),
    INDEX `historico_dataAcao_idx`(`dataAcao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_quadraId_fkey` FOREIGN KEY (`quadraId`) REFERENCES `quadras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_canceladaPorId_fkey` FOREIGN KEY (`canceladaPorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_comanda` ADD CONSTRAINT `itens_comanda_comandaId_fkey` FOREIGN KEY (`comandaId`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_comanda` ADD CONSTRAINT `itens_comanda_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bloqueios` ADD CONSTRAINT `bloqueios_quadraId_fkey` FOREIGN KEY (`quadraId`) REFERENCES `quadras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bloqueios` ADD CONSTRAINT `bloqueios_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico` ADD CONSTRAINT `historico_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
