import type { SellerProductEntry } from "../domain/index.js";

export interface ParsedSellerProductInput {
  entries: SellerProductEntry[];
  entriesRejected: RejectedSellerProductEntry[];
}

export interface RejectedSellerProductEntry {
  sourceIndex: number;
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
