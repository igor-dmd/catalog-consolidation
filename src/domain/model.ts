export type SellerProductReference = string;

export interface SellerProductEntry {
  sellerName: string;
  sellerProductReference: SellerProductReference;
  name: string;
  brand: string | null;
  category: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
}

export interface SellerProductLink {
  catalogProductId: number;
  sellerName: string;
  sellerProductReference: SellerProductReference;
}
