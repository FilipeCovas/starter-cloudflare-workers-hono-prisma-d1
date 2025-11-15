#!/usr/bin/env node

/**
 * Script para criar symlinks das migrations do Prisma
 * O Prisma cria migrations em subdiretórios, mas o Wrangler espera arquivos SQL diretamente no diretório
 * Este script cria symlinks para que o Wrangler encontre as migrations sem duplicar arquivos
 */

const fs = require("fs");
const path = require("path");

const prismaMigrationsDir = path.join(__dirname, "..", "prisma", "migrations");

// Encontrar todas as migrations do Prisma
const prismaMigrations = fs
  .readdirSync(prismaMigrationsDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .sort();

console.log(`Encontradas ${prismaMigrations.length} migrations do Prisma`);

// Criar symlinks para cada migration
prismaMigrations.forEach((migrationDir) => {
  const migrationSqlPath = path.join(
    prismaMigrationsDir,
    migrationDir,
    "migration.sql"
  );
  const symlinkPath = path.join(prismaMigrationsDir, `${migrationDir}.sql`);

  if (fs.existsSync(migrationSqlPath)) {
    // Remover symlink existente se houver
    try {
      if (fs.existsSync(symlinkPath)) {
        const stats = fs.lstatSync(symlinkPath);
        if (stats.isSymbolicLink() || stats.isFile()) {
          fs.unlinkSync(symlinkPath);
        }
      }
    } catch (err) {
      // Ignorar erros ao remover
    }
    // Criar novo symlink (relativo ao diretório de migrations)
    try {
      fs.symlinkSync(path.join(migrationDir, "migration.sql"), symlinkPath);
      console.log(`✓ Symlink criado: ${migrationDir}.sql`);
    } catch (err) {
      if (err.code !== "EEXIST") {
        console.error(
          `✗ Erro ao criar symlink para ${migrationDir}:`,
          err.message
        );
      }
    }
  } else {
    console.warn(`⚠ Aviso: migration.sql não encontrado em ${migrationDir}`);
  }
});

console.log("Symlinks criados com sucesso!");
