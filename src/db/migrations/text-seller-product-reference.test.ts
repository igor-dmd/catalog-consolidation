import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createSyntheticCatalogSchema } from "../../../test/fixtures/synthetic/catalog-schema.js";
import { applyTextSellerProductReferenceMigration } from "./text-seller-product-reference.js";

describe("text seller product reference migration", () => {
  it("changes seller product references from integer storage to text storage", () => {
    const db = new Database(":memory:");

    try {
      createSyntheticCatalogSchema(db);
      db.prepare(`
        INSERT INTO Products (Name, Brand, Category)
        VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
      `).run();
      db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'Camera Seller', 1001)
      `).run();

      applyTextSellerProductReferenceMigration(db);

      expect(columnType(db, "SellerProducts", "SellerProductId")).toBe("TEXT");
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
