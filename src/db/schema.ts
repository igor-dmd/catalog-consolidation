export interface CatalogProductRow {
  Id: number;
  Name: string;
  Brand: string | null;
  Category: string | null;
}

export interface SellerProductLinkRow {
  Id: number;
  ProductId: number;
  SellerName: string;
  SellerProductId: string;
}

export interface CatalogProductInsertParams {
  Name: string;
  Brand: string | null;
  Category: string | null;
}

export interface SellerProductLinkInsertParams {
  ProductId: number;
  SellerName: string;
  SellerProductId: string;
}
