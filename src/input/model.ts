import type {
  RejectedSellerProductEntry,
  SellerProductEntry
} from "../domain/index.js";

export interface ValidatedSellerProductInput {
  entries: SellerProductEntry[];
  entriesRejected: RejectedSellerProductEntry[];
}
