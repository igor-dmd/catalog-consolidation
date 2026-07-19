import { describe, expect, it } from "vitest";
import {
  cleanValue,
  productIdentitiesEqual,
  productIdentityFromValues
} from "./normalization.js";

describe("domain normalization", () => {
  it("cleans values by trimming and collapsing whitespace while preserving casing", () => {
    expect(cleanValue("  Camera   Canon\tEOS\nR6  ")).toBe("Camera Canon EOS R6");
    expect(cleanValue("  iPhone   Pro  MAX  ")).toBe("iPhone Pro MAX");
  });

  it("builds product identities from case-insensitive cleaned name and brand", () => {
    expect(productIdentityFromValues({
      name: "  Camera   Canon EOS R6 ",
      brand: " CANON "
    })).toEqual({
      normalizedName: "camera canon eos r6",
      normalizedBrand: "canon"
    });
  });

  it("compares product identities by normalized name and brand", () => {
    const sellerIdentity = productIdentityFromValues({
      name: "  CAMERA Canon   EOS R6 ",
      brand: " Canon "
    });
    const catalogIdentity = productIdentityFromValues({
      name: "camera canon eos r6",
      brand: "CANON"
    });

    expect(productIdentitiesEqual(sellerIdentity, catalogIdentity)).toBe(true);
  });

  it("treats missing or null brand as an empty identity component", () => {
    expect(productIdentityFromValues({
      name: " USB-C Cable ",
      brand: null
    })).toEqual({
      normalizedName: "usb-c cable",
      normalizedBrand: ""
    });

    expect(productIdentityFromValues({
      name: " USB-C Cable "
    })).toEqual({
      normalizedName: "usb-c cable",
      normalizedBrand: ""
    });
  });
});
