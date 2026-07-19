import type {
  CatalogProduct,
  SellerProductLink
} from "../domain/index.js";
import type {
  CatalogProductRow,
  CatalogProductInsertParams,
  SellerProductLinkInsertParams,
  SellerProductLinkRow
} from "./schema.js";

export function catalogProductFromRow(row: CatalogProductRow): CatalogProduct {
  return {
    id: row.Id,
    name: row.Name,
    brand: row.Brand,
    category: row.Category
  };
}

export function sellerProductLinkFromRow(row: SellerProductLinkRow): SellerProductLink {
  return {
    catalogProductId: row.ProductId,
    sellerName: row.SellerName,
    sellerProductReference: row.SellerProductId
  };
}

export function catalogProductToInsertParams(
  product: Omit<CatalogProduct, "id">
): CatalogProductInsertParams {
  return {
    Name: product.name,
    Brand: product.brand,
    Category: product.category
  };
}

export function sellerProductLinkToInsertParams(
  link: SellerProductLink
): SellerProductLinkInsertParams {
  return {
    ProductId: link.catalogProductId,
    SellerName: link.sellerName,
    SellerProductId: link.sellerProductReference
  };
}
