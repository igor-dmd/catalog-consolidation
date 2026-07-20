import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  hasSellerProductLink,
  insertCatalogProduct,
  insertSellerProductLink,
  listCatalogProducts
} from "./catalog-repository.js";
import { createMigratedAssessmentSchema } from "./helpers.js";

describe("catalog repository", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    createMigratedAssessmentSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it("lists catalog products as domain models", () => {
    db.prepare(`
      INSERT INTO Products (Name, Brand, Category)
      VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
    `).run();

    expect(listCatalogProducts(db)).toEqual([
      {
        id: 1,
        name: "Camera Canon EOS R6",
        brand: "Canon",
        category: "Photography"
      }
    ]);
  });

  it("inserts catalog products and returns the inserted domain model", () => {
    expect(insertCatalogProduct(db, {
      name: "USB-C Cable",
      brand: "Acme",
      category: "Accessories"
    })).toEqual({
      id: 1,
      name: "USB-C Cable",
      brand: "Acme",
      category: "Accessories"
    });
    expect(listCatalogProducts(db)).toEqual([
      {
        id: 1,
        name: "USB-C Cable",
        brand: "Acme",
        category: "Accessories"
      }
    ]);
  });

  it("detects and inserts seller product links by seller idempotency key", () => {
    db.prepare(`
      INSERT INTO Products (Name, Brand, Category)
      VALUES ('USB-C Cable', 'Acme', 'Accessories')
    `).run();

    const key = {
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001"
    };

    expect(hasSellerProductLink(db, key)).toBe(false);

    insertSellerProductLink(db, {
      catalogProductId: 1,
      ...key
    });

    expect(hasSellerProductLink(db, key)).toBe(true);
    expect(db.prepare(`
      SELECT ProductId, SellerName, SellerProductId
      FROM SellerProducts
    `).all()).toEqual([
      {
        ProductId: 1,
        SellerName: "Cable Seller",
        SellerProductId: "cable-001"
      }
    ]);
  });
});
