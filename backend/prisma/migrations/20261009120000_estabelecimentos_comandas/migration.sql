-- DropForeignKey
ALTER TABLE `comandas` DROP FOREIGN KEY `comandas_reservaId_fkey`;

-- DropIndex
DROP INDEX `comandas_reservaId_key` ON `comandas`;

-- DropIndex
DROP INDEX `categorias_nome_key` ON `categorias`;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `perfil` ENUM('CLIENTE', 'PROPRIETARIO', 'ADMIN') NOT NULL DEFAULT 'CLIENTE';

-- AlterTable
ALTER TABLE `quadras` ADD COLUMN `estabelecimentoId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `produtos` ADD COLUMN `estabelecimentoId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `categorias` ADD COLUMN `estabelecimentoId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `historico` ADD COLUMN `estabelecimentoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `estabelecimentos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `proprietarioId` VARCHAR(191) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAtualizacao` DATETIME(3) NOT NULL,

    INDEX `estabelecimentos_proprietarioId_idx`(`proprietarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `quadras_estabelecimentoId_idx` ON `quadras`(`estabelecimentoId`);

-- CreateIndex
CREATE UNIQUE INDEX `comandas_reservaId_usuarioId_key` ON `comandas`(`reservaId`, `usuarioId`);

-- CreateIndex
CREATE INDEX `produtos_estabelecimentoId_idx` ON `produtos`(`estabelecimentoId`);

-- CreateIndex
CREATE UNIQUE INDEX `categorias_estabelecimentoId_nome_key` ON `categorias`(`estabelecimentoId`, `nome`);

-- AddForeignKey
ALTER TABLE `estabelecimentos` ADD CONSTRAINT `estabelecimentos_proprietarioId_fkey` FOREIGN KEY (`proprietarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quadras` ADD CONSTRAINT `quadras_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `estabelecimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `estabelecimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `estabelecimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico` ADD CONSTRAINT `historico_estabelecimentoId_fkey` FOREIGN KEY (`estabelecimentoId`) REFERENCES `estabelecimentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
