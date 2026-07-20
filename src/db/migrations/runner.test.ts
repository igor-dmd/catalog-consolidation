import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createLegacyAssessmentSchema } from "../helpers.js";
import { runCatalogMigrations } from "./runner.js";

describe("catalog migration runner", () => {
  it("applies catalog migrations once and records them", () => {
    const db = new Database(":memory:");

    try {
      createLegacyAssessmentSchema(db);
      db.prepare(`
        INSERT INTO Products (Name, Brand, Category)
        VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
      `).run();
      db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'Camera Seller', 1001)
      `).run();

      expect(columnType(db, "SellerProducts", "SellerProductId")).toBe("INTEGER");

      runCatalogMigrations(db);
      runCatalogMigrations(db);

      expect(columnType(db, "SellerProducts", "SellerProductId")).toBe("TEXT");
      expect(uniqueIndexColumns(db, "SellerProducts")).toEqual([
        ["SellerName", "SellerProductId"]
      ]);
      expect(db.prepare(`
        SELECT Id
        FROM CatalogMigrations
        ORDER BY Id
      `).all()).toEqual([
        { Id: "001_text_seller_product_reference" },
        { Id: "002_seller_product_link_uniqueness" }
      ]);
      expect(db.prepare(`
        SELECT SellerProductId
        FROM SellerProducts
        WHERE SellerName = 'Camera Seller'
      `).get()).toEqual({
        SellerProductId: "1001"
      });

      const uuidReference = "87bbf5ad-9a90-43bb-9616-90223198ad86";
      db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'UUID Seller', ?)
      `).run(uuidReference);
      expect(db.prepare(`
        SELECT SellerProductId
        FROM SellerProducts
        WHERE SellerName = 'UUID Seller'
      `).get()).toEqual({
        SellerProductId: uuidReference
      });

      expect(() => db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'UUID Seller', ?)
      `).run(uuidReference)).toThrow(/UNIQUE constraint failed/);
      expect(() => db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'Other Seller', ?)
      `).run(uuidReference)).not.toThrow();
    } finally {
      db.close();
    }
  });
});

function columnType(
  db: Database.Database,
  tableName: string,
  columnName: string
): string | undefined {
  return (db.prepare(`
    SELECT type
    FROM pragma_table_info(?)
    WHERE name = ?
  `).get(tableName, columnName) as { type: string } | undefined)?.type;
}

function uniqueIndexColumns(
  db: Database.Database,
  tableName: string
): string[][] {
  return db.prepare(`
    SELECT name
    FROM pragma_index_list(?)
    WHERE "unique" = 1
    ORDER BY name
  `).all(tableName).map((indexRow) => {
    const indexName = (indexRow as { name: string }).name;

    return db.prepare(`
      SELECT name
      FROM pragma_index_info(?)
      ORDER BY seqno
    `).all(indexName).map((columnRow) => (columnRow as { name: string }).name);
  });
}
