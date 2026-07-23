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

export interface ProductIdentity {
  normalizedName: string;
  normalizedBrand: string;
  normalizedCategory: string;
}

export interface RejectedSellerProductEntry {
  sellerName?: string;
  sellerProductReference?: string;
  reasons: RejectedSellerProductEntryReason[];
}

export interface RejectedSellerProductEntryReason {
  field: string;
  code: RejectedSellerProductEntryReasonCode;
  message: string;
}

export type RejectedSellerProductEntryReasonCode =
  | "required"
  | "invalid_type"
  | "duplicate_seller_entry"
  | "ambiguous_match";
