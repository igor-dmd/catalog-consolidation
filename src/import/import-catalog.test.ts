import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMigratedAssessmentSchema } from "../db/helpers.js";
import { CatalogImportWriteError } from "./errors.js";
import { importCatalogProducts } from "./import-catalog.js";

describe("catalog import use case", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createMigratedAssessmentSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it("matches existing catalog products by normalized name and brand", () => {
    db.prepare(`
      INSERT INTO Product (Name, Brand, Category)
      VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
    `).run();

    const result = importCatalogProducts(db, [
      {
        sellerName: "Camera Seller",
        sellerProductReference: "camera-r6-001",
        name: " camera   canon eos r6 ",
        brand: " CANON ",
        category: "Seller Photography"
      }
    ]);

    expect(result).toEqual({
      productsInserted: 0,
      productsMatched: 1,
      sellerLinksCreated: 1,
      sellerLinksSkipped: 0,
      entriesRejected: []
    });
    expect(db.prepare(`
      SELECT Name, Brand, Category
      FROM Product
    `).all()).toEqual([
      {
        Name: "Camera Canon EOS R6",
        Brand: "Canon",
        Category: "Photography"
      }
    ]);
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProduct
    `).all()).toEqual([
      {
        ProductId: 1,
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-001"
      }
    ]);
  });

  it("inserts missing catalog products using cleaned source values", () => {
    const result = importCatalogProducts(db, [
      {
        sellerName: "Cable Seller",
        sellerProductReference: "cable-001",
        name: " USB-C   Cable ",
        brand: " Acme ",
        category: " Accessories "
      }
    ]);

    expect(result).toEqual({
      productsInserted: 1,
      productsMatched: 0,
      sellerLinksCreated: 1,
      sellerLinksSkipped: 0,
      entriesRejected: []
    });
    expect(db.prepare(`
      SELECT Name, Brand, Category
      FROM Product
    `).all()).toEqual([
      {
        Name: "USB-C Cable",
        Brand: "Acme",
        Category: "Accessories"
      }
    ]);
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProduct
    `).all()).toEqual([
      {
        ProductId: 1,
        SellerName: "Cable Seller",
        SellerProductId: "cable-001"
      }
    ]);
  });

  it("matches brandless seller entries only to brandless catalog products", () => {
    db.prepare(`
      INSERT INTO Product (Name, Brand, Category)
      VALUES
        ('USB-C Cable', 'Acme', 'Accessories'),
        ('USB-C Cable', NULL, 'Cables')
    `).run();

    const result = importCatalogProducts(db, [
      {
        sellerName: "Cable Seller",
        sellerProductReference: "brandless-cable-001",
        name: " usb-c cable ",
        brand: null,
        category: null
      }
    ]);

    expect(result).toEqual({
      productsInserted: 0,
      productsMatched: 1,
      sellerLinksCreated: 1,
      sellerLinksSkipped: 0,
      entriesRejected: []
    });
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProduct
    `).all()).toEqual([
      {
        ProductId: 2,
        SellerName: "Cable Seller",
        SellerProductId: "brandless-cable-001"
      }
    ]);
  });

  it("rejects ambiguous catalog matches without creating seller links", () => {
    db.prepare(`
      INSERT INTO Product (Name, Brand, Category)
      VALUES
        ('USB-C Cable', 'Acme', 'Accessories'),
        (' usb-c   cable ', ' ACME ', 'Cables')
    `).run();

    const result = importCatalogProducts(db, [
      {
        sellerName: "Cable Seller",
        sellerProductReference: "cable-ambiguous-001",
        name: "USB-C Cable",
        brand: "acme",
        category: null
      }
    ]);

    expect(result).toEqual({
      productsInserted: 0,
      productsMatched: 0,
      sellerLinksCreated: 0,
      sellerLinksSkipped: 0,
      entriesRejected: [
        {
          sellerName: "Cable Seller",
          sellerProductReference: "cable-ambiguous-001",
          reasons: [
            {
              field: "Name+Brand",
              code: "ambiguous_match",
              message: "Seller product identity matches multiple catalog products."
            }
          ]
        }
      ]
    });
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProduct
    `).all()).toEqual([]);
  });

  it("reports ambiguous catalog matches while writing valid entries", () => {
    db.prepare(`
      INSERT INTO Product (Name, Brand, Category)
      VALUES
        ('USB-C Cable', 'Acme', 'Accessories'),
        (' usb-c   cable ', ' ACME ', 'Cables')
    `).run();

    const result = importCatalogProducts(db, [
      {
        sellerName: "Camera Seller",
        sellerProductReference: "camera-r6-001",
        name: "Camera Canon EOS R6",
        brand: "Canon",
        category: "Photography"
      },
      {
        sellerName: "Cable Seller",
        sellerProductReference: "cable-ambiguous-001",
        name: "USB-C Cable",
        brand: "acme",
        category: null
      }
    ]);

    expect(result).toEqual({
      productsInserted: 1,
      productsMatched: 0,
      sellerLinksCreated: 1,
      sellerLinksSkipped: 0,
      entriesRejected: [
        {
          sellerName: "Cable Seller",
          sellerProductReference: "cable-ambiguous-001",
          reasons: [
            {
              field: "Name+Brand",
              code: "ambiguous_match",
              message: "Seller product identity matches multiple catalog products."
            }
          ]
        }
      ]
    });
    expect(db.prepare(`
      SELECT Name, Brand, Category
      FROM Product
      ORDER BY Id
    `).all()).toEqual([
      {
        Name: "USB-C Cable",
        Brand: "Acme",
        Category: "Accessories"
      },
      {
        Name: " usb-c   cable ",
        Brand: " ACME ",
        Category: "Cables"
      },
      {
        Name: "Camera Canon EOS R6",
        Brand: "Canon",
        Category: "Photography"
      }
    ]);
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProduct
    `).all()).toEqual([
      {
        ProductId: 3,
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-001"
      }
    ]);
  });

  it("creates seller links once and skips them on repeated imports", () => {
    const entry = {
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001",
      name: "USB-C Cable",
      brand: "Acme",
      category: "Accessories"
    };

    const firstResult = importCatalogProducts(db, [entry]);
    const secondResult = importCatalogProducts(db, [entry]);

    expect(firstResult).toEqual({
      productsInserted: 1,
      productsMatched: 0,
      sellerLinksCreated: 1,
      sellerLinksSkipped: 0,
      entriesRejected: []
    });
    expect(secondResult).toEqual({
      productsInserted: 0,
      productsMatched: 0,
      sellerLinksCreated: 0,
      sellerLinksSkipped: 1,
      entriesRejected: []
    });
    expect(db.prepare("SELECT COUNT(*) AS count FROM Product").get()).toEqual({ count: 1 });
    expect(db.prepare("SELECT COUNT(*) AS count FROM SellerProduct").get()).toEqual({ count: 1 });
  });

  it("rolls back valid-entry writes when an unexpected write failure occurs", () => {
    db.exec(`
      CREATE TRIGGER fail_second_seller_link_insert
      BEFORE INSERT ON SellerProduct
      WHEN (SELECT COUNT(*) FROM SellerProduct) = 1
      BEGIN
        SELECT RAISE(ABORT, 'simulated seller link failure');
      END;
    `);

    expect(() => importCatalogProducts(db, [
      {
        sellerName: "Cable Seller",
        sellerProductReference: "cable-001",
        name: "USB-C Cable",
        brand: "Acme",
        category: "Accessories"
      },
      {
        sellerName: "Camera Seller",
        sellerProductReference: "camera-001",
        name: "Camera Canon EOS R6",
        brand: "Canon",
        category: "Photography"
      }
    ])).toThrow(CatalogImportWriteError);

    expect(db.prepare("SELECT COUNT(*) AS count FROM Product").get()).toEqual({ count: 0 });
    expect(db.prepare("SELECT COUNT(*) AS count FROM SellerProduct").get()).toEqual({ count: 0 });
  });
});
