import { describe, expect, it } from "vitest";
import { validateSellerProductInput } from "./validation.js";

describe("seller product input validation", () => {
  it("maps valid source entries to seller product entries", () => {
    expect(validateSellerProductInput([
      {
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-001",
        Name: "  Camera Canon EOS R6  ",
        Brand: " Canon ",
        Category: " Photography "
      }
    ])).toEqual({
      entries: [
        {
          sellerName: "Camera Seller",
          sellerProductReference: "camera-r6-001",
          name: "  Camera Canon EOS R6  ",
          brand: " Canon ",
          category: " Photography "
        }
      ],
      entriesRejected: []
    });
  });

  it("defaults missing or null optional metadata to null", () => {
    expect(validateSellerProductInput([
      {
        SellerName: "Cable Seller",
        SellerProductId: "cable-001",
        Name: "USB-C Cable",
        Brand: null
      }
    ])).toEqual({
      entries: [
        {
          sellerName: "Cable Seller",
          sellerProductReference: "cable-001",
          name: "USB-C Cable",
          brand: null,
          category: null
        }
      ],
      entriesRejected: []
    });
  });

  it("rejects invalid entries with identifying context and reasons", () => {
    expect(validateSellerProductInput([
      {
        SellerName: "Missing Name Seller",
        SellerProductId: "missing-name-001",
        Brand: "Acme",
        Category: "Accessories"
      },
      {
        SellerName: "Invalid Reference Seller",
        SellerProductId: 42,
        Name: "USB-C Cable",
        Brand: null,
        Category: null
      }
    ])).toEqual({
      entries: [],
      entriesRejected: [
        {
          sourceIndex: 0,
          sellerName: "Missing Name Seller",
          sellerProductReference: "missing-name-001",
          reasons: [
            {
              field: "Name",
              code: "required",
              message: "Name must be a non-empty string."
            }
          ]
        },
        {
          sourceIndex: 1,
          sellerName: "Invalid Reference Seller",
          reasons: [
            {
              field: "SellerProductId",
              code: "invalid_type",
              message: "SellerProductId must be a string."
            }
          ]
        }
      ]
    });
  });

  it("rejects duplicate seller entry idempotency keys after the first occurrence", () => {
    expect(validateSellerProductInput([
      {
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-001",
        Name: "Camera Canon EOS R6",
        Brand: "Canon",
        Category: "Photography"
      },
      {
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-001",
        Name: "Duplicate Camera Canon EOS R6",
        Brand: "Canon",
        Category: "Photography"
      },
      {
        SellerName: "Camera Seller",
        SellerProductId: "camera-r6-002",
        Name: "Camera Canon EOS R7",
        Brand: "Canon",
        Category: "Photography"
      }
    ])).toEqual({
      entries: [
        {
          sellerName: "Camera Seller",
          sellerProductReference: "camera-r6-001",
          name: "Camera Canon EOS R6",
          brand: "Canon",
          category: "Photography"
        },
        {
          sellerName: "Camera Seller",
          sellerProductReference: "camera-r6-002",
          name: "Camera Canon EOS R7",
          brand: "Canon",
          category: "Photography"
        }
      ],
      entriesRejected: [
        {
          sourceIndex: 1,
          sellerName: "Camera Seller",
          sellerProductReference: "camera-r6-001",
          reasons: [
            {
              field: "SellerProductId",
              code: "duplicate",
              message: "SellerName + SellerProductId must be unique within the input file."
            }
          ]
        }
      ]
    });
  });
});
