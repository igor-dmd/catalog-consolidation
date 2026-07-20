import { readFileSync } from "node:fs";
import type Database from "better-sqlite3";

interface CatalogMigration {
  id: string;
  sqlPath: URL;
}

const catalogMigrations: CatalogMigration[] = [
  {
    id: "001_text_seller_product_reference",
    sqlPath: new URL("./001_text_seller_product_reference.sql", import.meta.url)
  },
  {
    id: "002_seller_product_link_uniqueness",
    sqlPath: new URL("./002_seller_product_link_uniqueness.sql", import.meta.url)
  }
];

export function runCatalogMigrations(db: Database.Database): void {
  ensureCatalogMigrationsTable(db);

  for (const migration of catalogMigrations) {
    if (hasMigrationBeenApplied(db, migration.id)) {
      continue;
    }

    db.exec(readFileSync(migration.sqlPath, "utf8"));
    db.prepare(`
      INSERT INTO CatalogMigrations (Id)
      VALUES (?)
    `).run(migration.id);
  }
}

function ensureCatalogMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS CatalogMigrations (
      Id TEXT PRIMARY KEY,
      AppliedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function hasMigrationBeenApplied(
  db: Database.Database,
  migrationId: string
): boolean {
  return db.prepare(`
    SELECT 1
    FROM CatalogMigrations
    WHERE Id = ?
  `).get(migrationId) !== undefined;
}
