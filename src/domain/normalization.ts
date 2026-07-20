import type {
  CatalogProduct,
  ProductIdentity,
  SellerProductEntry
} from "./model.js";

interface ProductIdentitySource {
  name: string;
  brand?: string | null;
}

export type CatalogMatchClassification =
  | { kind: "noMatch" }
  | { kind: "matched"; catalogProduct: CatalogProduct }
  | { kind: "ambiguous"; catalogProducts: CatalogProduct[] };

export function cleanValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function classifyCatalogMatch(
  sellerProductEntry: SellerProductEntry,
  catalogProducts: CatalogProduct[]
): CatalogMatchClassification {
  const sellerProductIdentity = productIdentityFromSource(sellerProductEntry);
  const catalogProductMatches = catalogProducts.filter((catalogProduct) =>
    productIdentitiesEqual(sellerProductIdentity, productIdentityFromSource(catalogProduct))
  );

  if (catalogProductMatches.length === 0) {
    return { kind: "noMatch" };
  }

  if (catalogProductMatches.length === 1) {
    return { kind: "matched", catalogProduct: catalogProductMatches[0] };
  }

  return { kind: "ambiguous", catalogProducts: catalogProductMatches };
}

function productIdentityFromSource(source: ProductIdentitySource): ProductIdentity {
  return {
    normalizedName: normalizeForIdentityComparison(source.name),
    normalizedBrand: normalizeForIdentityComparison(source.brand ?? "")
  };
}

function productIdentitiesEqual(left: ProductIdentity, right: ProductIdentity): boolean {
  return left.normalizedName === right.normalizedName
    && left.normalizedBrand === right.normalizedBrand;
}

function normalizeForIdentityComparison(value: string): string {
  return cleanValue(value).toLowerCase();
}
