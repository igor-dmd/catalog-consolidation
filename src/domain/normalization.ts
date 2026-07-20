import type {
  CatalogProduct,
  SellerProductEntry
} from "./model.js";

interface ProductIdentity {
  normalizedName: string;
  normalizedBrand: string;
}

interface ProductIdentityValues {
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
  const sellerProductIdentity = productIdentityFromValues(sellerProductEntry);
  const catalogProductMatches = catalogProducts.filter((catalogProduct) =>
    productIdentitiesEqual(sellerProductIdentity, productIdentityFromValues(catalogProduct))
  );

  if (catalogProductMatches.length === 0) {
    return { kind: "noMatch" };
  }

  if (catalogProductMatches.length === 1) {
    return { kind: "matched", catalogProduct: catalogProductMatches[0] };
  }

  return { kind: "ambiguous", catalogProducts: catalogProductMatches };
}

function productIdentityFromValues(values: ProductIdentityValues): ProductIdentity {
  return {
    normalizedName: normalizeForIdentityComparison(values.name),
    normalizedBrand: normalizeForIdentityComparison(values.brand ?? "")
  };
}

function productIdentitiesEqual(left: ProductIdentity, right: ProductIdentity): boolean {
  return left.normalizedName === right.normalizedName
    && left.normalizedBrand === right.normalizedBrand;
}

function normalizeForIdentityComparison(value: string): string {
  return cleanValue(value).toLowerCase();
}
