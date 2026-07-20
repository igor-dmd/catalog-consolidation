import { describe, expect, expectTypeOf, it } from "vitest";
import type { CatalogProduct, SellerProductLink } from "../domain/index.js";
import {
  catalogProductFromRow,
  catalogProductToInsertParams,
  sellerProductLinkFromRow,
  sellerProductLinkToInsertParams
} from "./mappers.js";
import type {
  CatalogProductInsertParams,
  CatalogProductRow,
  SellerProductLinkInsertParams,
  SellerProductLinkRow
} from "./schema.js";

describe("database row mappers", () => {
  it("maps catalog product rows to domain products", () => {
    const row: CatalogProductRow = {
      Id: 7,
      Name: "Camera Canon EOS R6",
      Brand: "Canon",
      Category: null
    };

    const product = catalogProductFromRow(row);

    expect(product).toEqual({
      id: 7,
      name: "Camera Canon EOS R6",
      brand: "Canon",
      category: null
    });
    expectTypeOf(row).not.toEqualTypeOf<CatalogProduct>();
  });

  it("maps seller product link rows to domain links", () => {
    const row: SellerProductLinkRow = {
      Id: 3,
      ProductId: 7,
      SellerName: "Seller A",
      SellerProductId: "87bbf5ad-9a90-43bb-9616-90223198ad86"
    };

    expect(sellerProductLinkFromRow(row)).toEqual({
      catalogProductId: 7,
      sellerName: "Seller A",
      sellerProductReference: "87bbf5ad-9a90-43bb-9616-90223198ad86"
    });
  });

  it("maps domain products to database insert params without changing null metadata", () => {
    expect(catalogProductToInsertParams({
      name: "Brandless Cable",
      brand: null,
      category: null
    })).toEqual({
      Name: "Brandless Cable",
      Brand: null,
      Category: null
    });
    expectTypeOf(catalogProductToInsertParams({
      name: "Brandless Cable",
      brand: null,
      category: null
    })).toEqualTypeOf<CatalogProductInsertParams>();
  });

  it("maps domain links to database params while preserving seller product references", () => {
    const link: SellerProductLink = {
      catalogProductId: 7,
      sellerName: "Seller A",
      sellerProductReference: "sku-001"
    };

    const params = sellerProductLinkToInsertParams(link);

    expect(params).toEqual({
      ProductId: 7,
      SellerName: "Seller A",
      SellerProductId: "sku-001"
    });
    expectTypeOf(params).toEqualTypeOf<SellerProductLinkInsertParams>();
  });
});
