import type Database from "better-sqlite3";
import type {
  CatalogProduct,
  SellerProductLink
} from "../domain/index.js";
import type {
  CatalogProductInsertParams,
  CatalogProductRow,
  SellerProductLinkInsertParams
} from "./schema.js";

interface SellerProductLinkKey {
  sellerName: string;
  sellerProductReference: string;
}

export function listCatalogProducts(db: Database.Database): CatalogProduct[] {
  return db.prepare(`
    SELECT Id, Name, Brand, Category
    FROM Products
    ORDER BY Id
  `).all().map((row) => catalogProductFromRow(row as CatalogProductRow));
}

export function insertCatalogProduct(
  db: Database.Database,
  product: Omit<CatalogProduct, "id">
): CatalogProduct {
  const params = catalogProductToInsertParams(product);
  const result = db.prepare(`
    INSERT INTO Products (Name, Brand, Category)
    VALUES (@Name, @Brand, @Category)
  `).run(params satisfies CatalogProductInsertParams);

  return {
    id: Number(result.lastInsertRowid),
    ...product
  };
}

export function hasSellerProductLink(
  db: Database.Database,
  key: SellerProductLinkKey
): boolean {
  return db.prepare(`
    SELECT 1
    FROM SellerProducts
    WHERE SellerName = ?
      AND SellerProductId = ?
  `).get(key.sellerName, key.sellerProductReference) !== undefined;
}

export function insertSellerProductLink(
  db: Database.Database,
  link: SellerProductLink
): void {
  const params = sellerProductLinkToInsertParams(link);

  db.prepare(`
    INSERT INTO SellerProducts (ProductId, SellerName, SellerProductId)
    VALUES (@ProductId, @SellerName, @SellerProductId)
  `).run(params);
}

function catalogProductFromRow(row: CatalogProductRow): CatalogProduct {
  return {
    id: row.Id,
    name: row.Name,
    brand: row.Brand,
    category: row.Category
  };
}

function catalogProductToInsertParams(
  product: Omit<CatalogProduct, "id">
): CatalogProductInsertParams {
  return {
    Name: product.name,
    Brand: product.brand,
    Category: product.category
  };
}

function sellerProductLinkToInsertParams(
  link: SellerProductLink
): SellerProductLinkInsertParams {
  return {
    ProductId: link.catalogProductId,
    SellerName: link.sellerName,
    SellerProductId: link.sellerProductReference
  };
}
