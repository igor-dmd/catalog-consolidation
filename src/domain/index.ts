export type {
  CatalogProduct,
  ProductIdentity,
  RejectedSellerProductEntry,
  RejectedSellerProductEntryReason,
  RejectedSellerProductEntryReasonCode,
  SellerProductEntry,
  SellerProductLink,
  SellerProductReference
} from "./model.js";

export {
  classifyCatalogMatch,
  cleanValue,
} from "./normalization.js";

export type {
  CatalogMatchClassification
} from "./normalization.js";
