import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createSyntheticCatalogSchema } from "../../test/fixtures/synthetic/catalog-schema.js";

describe("synthetic catalog schema fixture", () => {
  it("creates representative catalog and seller product link tables", () => {
    const db = new Database(":memory:");

    try {
      createSyntheticCatalogSchema(db);

      expect(tableColumns(db, "Products")).toEqual([
        { name: "Id", type: "INTEGER", notnull: 0, pk: 1 },
        { name: "Name", type: "TEXT", notnull: 1, pk: 0 },
        { name: "Brand", type: "TEXT", notnull: 0, pk: 0 },
        { name: "Category", type: "TEXT", notnull: 0, pk: 0 }
      ]);
      expect(tableColumns(db, "SellerProducts")).toEqual([
        { name: "Id", type: "INTEGER", notnull: 0, pk: 1 },
        { name: "ProductId", type: "INTEGER", notnull: 1, pk: 0 },
        { name: "SellerName", type: "TEXT", notnull: 1, pk: 0 },
        { name: "SellerProductId", type: "INTEGER", notnull: 1, pk: 0 }
      ]);

      db.prepare(`
        INSERT INTO Products (Name, Brand, Category)
        VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
      `).run();
      db.prepare(`
        INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
        VALUES (1, 'Camera Seller', 1001)
      `).run();

      expect(db.prepare(`
        SELECT
          Products.Name,
          Products.Brand,
          SellerProducts.SellerName,
          SellerProducts.SellerProductId
        FROM SellerProducts
        INNER JOIN Products ON Products.Id = SellerProducts.ProductId
      `).get()).toEqual({
        Name: "Camera Canon EOS R6",
        Brand: "Canon",
        SellerName: "Camera Seller",
        SellerProductId: 1001
      });
    } finally {
      db.close();
    }
  });
});

interface TableColumnRow {
  name: string;
  type: string;
  notnull: number;
  pk: number;
}

function tableColumns(db: Database.Database, tableName: string): TableColumnRow[] {
  return db.prepare(`
    SELECT name, type, "notnull", pk
    FROM pragma_table_info(?)
    ORDER BY cid
  `).all(tableName) as TableColumnRow[];
}
