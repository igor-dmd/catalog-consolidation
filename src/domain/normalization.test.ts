import { describe, expect, it } from "vitest";
import {
  classifyCatalogMatch,
  cleanValue,
} from "./normalization.js";

describe("domain normalization", () => {
  it("cleans values by trimming and collapsing whitespace while preserving casing", () => {
    expect(cleanValue("  Camera   Canon\tEOS\nR6  ")).toBe("Camera Canon EOS R6");
    expect(cleanValue("  iPhone   Pro  MAX  ")).toBe("iPhone Pro MAX");
  });

  it("matches a seller product entry to a catalog product by normalized name, brand, and category", () => {
    expect(classifyCatalogMatch({
      sellerName: "Camera Seller",
      sellerProductReference: "camera-r6-001",
      name: "  CAMERA Canon   EOS R6 ",
      brand: " Canon ",
      category: " PhotoGRAPHY "
    }, [
      {
        id: 7,
        name: "camera canon eos r6",
        brand: "CANON",
        category: "photography"
      }
    ])).toEqual({
      kind: "matched",
      catalogProduct: {
        id: 7,
        name: "camera canon eos r6",
        brand: "CANON",
        category: "photography"
      }
    });
  });

  it("returns no match when category differs from a catalog product with the same name and brand", () => {
    expect(classifyCatalogMatch({
      sellerName: "Camera Seller",
      sellerProductReference: "camera-r6-001",
      name: "Camera Canon EOS R6",
      brand: "Canon",
      category: "Photo"
    }, [
      {
        id: 7,
        name: "Camera Canon EOS R6",
        brand: "Canon",
        category: "Photography"
      }
    ])).toEqual({ kind: "noMatch" });
  });

  it("returns no match when no catalog product has the same product identity", () => {
    expect(classifyCatalogMatch({
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001",
      name: "USB-C Cable",
      brand: "Acme",
      category: null
    }, [
      {
        id: 7,
        name: "USB-C Cable",
        brand: "Other Brand",
        category: null
      }
    ])).toEqual({ kind: "noMatch" });
  });

  it("returns ambiguous when multiple catalog products have the same product identity", () => {
    const catalogProducts = [
      {
        id: 7,
        name: "USB-C Cable",
        brand: "Acme",
        category: "Accessories"
      },
      {
        id: 8,
        name: " usb-c   cable ",
        brand: " ACME ",
        category: " accessories "
      }
    ];

    expect(classifyCatalogMatch({
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001",
      name: "USB-C Cable",
      brand: "acme",
      category: "ACCESSORIES"
    }, catalogProducts)).toEqual({
      kind: "ambiguous",
      catalogProducts
    });
  });

  it("matches brandless seller product entries only to brandless catalog products", () => {
    expect(classifyCatalogMatch({
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001",
      name: " USB-C Cable ",
      brand: null,
      category: null
    }, [
      {
        id: 7,
        name: "USB-C Cable",
        brand: "Acme",
        category: null
      },
      {
        id: 8,
        name: "USB-C Cable",
        brand: null,
        category: null
      }
    ])).toEqual({
      kind: "matched",
      catalogProduct: {
        id: 8,
        name: "USB-C Cable",
        brand: null,
        category: null
      }
    });
  });

  it("matches categoryless seller product entries only to categoryless catalog products", () => {
    expect(classifyCatalogMatch({
      sellerName: "Cable Seller",
      sellerProductReference: "cable-001",
      name: " USB-C Cable ",
      brand: "Acme",
      category: null
    }, [
      {
        id: 7,
        name: "USB-C Cable",
        brand: "Acme",
        category: "Accessories"
      },
      {
        id: 8,
        name: "USB-C Cable",
        brand: "Acme",
        category: null
      }
    ])).toEqual({
      kind: "matched",
      catalogProduct: {
        id: 8,
        name: "USB-C Cable",
        brand: "Acme",
        category: null
      }
    });
  });
});
