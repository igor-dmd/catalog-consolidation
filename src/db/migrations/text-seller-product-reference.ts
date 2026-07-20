import { readFileSync } from "node:fs";
import type Database from "better-sqlite3";

const migrationSqlPath = new URL(
  "./001_text_seller_product_reference.sql",
  import.meta.url
);

export function applyTextSellerProductReferenceMigration(
  db: Database.Database
): void {
  db.exec(readFileSync(migrationSqlPath, "utf8"));
}
