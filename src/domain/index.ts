export type {
  CatalogProduct,
  SellerProductEntry,
  SellerProductLink,
  SellerProductReference
} from "./model.js";

export {
  cleanValue,
  productIdentitiesEqual,
  productIdentityFromValues
} from "./normalization.js";

export type {
  ProductIdentity,
  ProductIdentityValues
} from "./normalization.js";
