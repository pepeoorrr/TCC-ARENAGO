-- CreateTable
CREATE TABLE `usuario` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `perfil` ENUM('ADMIN', 'RECEPCIONISTA', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quadra` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `tipo` ENUM('BEACH_TENNIS', 'VOLEI_PRAIA', 'FUTEBOL_SOCIETY') NOT NULL,
    `valor_hora` DECIMAL(10, 2) NOT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reserva` (
    `id` VARCHAR(36) NOT NULL,
    `id_cliente` VARCHAR(36) NOT NULL,
    `id_quadra` VARCHAR(36) NOT NULL,
    `data` DATE NOT NULL,
    `horario_inicio` TIME(0) NOT NULL,
    `horario_fim` TIME(0) NOT NULL,
    `duracao_min` INTEGER NOT NULL,
    `status` ENUM('PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `reserva_id_cliente_idx`(`id_cliente`),
    INDEX `reserva_data_idx`(`data`),
    UNIQUE INDEX `reserva_id_quadra_data_horario_inicio_key`(`id_quadra`, `data`, `horario_inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comanda` (
    `id` VARCHAR(36) NOT NULL,
    `id_reserva` VARCHAR(36) NULL,
    `id_cliente` VARCHAR(36) NOT NULL,
    `status` ENUM('ABERTA', 'FECHADA', 'CANCELADA') NOT NULL DEFAULT 'ABERTA',
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechado_em` DATETIME(3) NULL,

    UNIQUE INDEX `comanda_id_reserva_key`(`id_reserva`),
    INDEX `comanda_id_cliente_idx`(`id_cliente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto` (
    `id` VARCHAR(36) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `quantidade_estoque` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comanda_item` (
    `id` VARCHAR(36) NOT NULL,
    `id_comanda` VARCHAR(36) NOT NULL,
    `id_produto` VARCHAR(36) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `preco_unit` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `comanda_item_id_comanda_idx`(`id_comanda`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_id_quadra_fkey` FOREIGN KEY (`id_quadra`) REFERENCES `quadra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comanda` ADD CONSTRAINT `comanda_id_reserva_fkey` FOREIGN KEY (`id_reserva`) REFERENCES `reserva`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comanda` ADD CONSTRAINT `comanda_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comanda_item` ADD CONSTRAINT `comanda_item_id_comanda_fkey` FOREIGN KEY (`id_comanda`) REFERENCES `comanda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comanda_item` ADD CONSTRAINT `comanda_item_id_produto_fkey` FOREIGN KEY (`id_produto`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
