export interface ProductIdentity {
  normalizedName: string;
  normalizedBrand: string;
}

export interface ProductIdentityValues {
  name: string;
  brand?: string | null;
}

export function cleanValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function productIdentityFromValues(values: ProductIdentityValues): ProductIdentity {
  return {
    normalizedName: normalizeForIdentityComparison(values.name),
    normalizedBrand: normalizeForIdentityComparison(values.brand ?? "")
  };
}

export function productIdentitiesEqual(left: ProductIdentity, right: ProductIdentity): boolean {
  return left.normalizedName === right.normalizedName
    && left.normalizedBrand === right.normalizedBrand;
}

function normalizeForIdentityComparison(value: string): string {
  return cleanValue(value).toLowerCase();
}
