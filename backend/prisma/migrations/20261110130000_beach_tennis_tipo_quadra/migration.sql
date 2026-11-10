-- Add sand-sport modalities while preserving existing court types.
ALTER TABLE `quadras`
  MODIFY `tipo` ENUM('BEACH_TENNIS', 'FUTEVOLEI', 'FUTSAL', 'VOLEI', 'BASQUETE', 'TENIS', 'OUTRO') NOT NULL;
