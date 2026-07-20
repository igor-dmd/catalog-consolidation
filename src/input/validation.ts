import type {
  RejectedSellerProductEntry,
  RejectedSellerProductEntryReason,
  SellerProductEntry
} from "../domain/index.js";
import { InputValidationInvariantError } from "./errors.js";
import type {
  ValidatedSellerProductInput
} from "./model.js";

type FieldValidation<T> =
  | { ok: true; value: T }
  | { ok: false; reason: RejectedSellerProductEntryReason };

interface SellerEntryIdempotencyKey {
  sellerName: string;
  sellerProductReference: string;
}

export function validateSellerProductInput(input: unknown): ValidatedSellerProductInput {
  const sourceEntries = Array.isArray(input) ? input : [];
  const entries: SellerProductEntry[] = [];
  const entriesRejected: RejectedSellerProductEntry[] = [];
  const acceptedSellerEntryKeys = new Set<string>();

  sourceEntries.forEach((sourceEntry) => {
    const parsedEntry = validateSellerProductEntry(sourceEntry);

    if ("rejectedEntry" in parsedEntry) {
      entriesRejected.push(parsedEntry.rejectedEntry);
      return;
    }

    const sellerEntryKey = sellerEntryIdempotencyKeyFromEntry(parsedEntry.entry);

    if (acceptedSellerEntryKeys.has(serializeSellerEntryIdempotencyKey(sellerEntryKey))) {
      entriesRejected.push(rejectDuplicateSellerEntry(parsedEntry.entry));
      return;
    }

    acceptedSellerEntryKeys.add(serializeSellerEntryIdempotencyKey(sellerEntryKey));
    entries.push(parsedEntry.entry);
  });

  return { entries, entriesRejected };
}

function validateSellerProductEntry(
  sourceEntry: unknown
): { entry: SellerProductEntry } | { rejectedEntry: RejectedSellerProductEntry } {
  const sourceObject = toSourceEntryObject(sourceEntry);

  const sellerName = validateRequiredString(sourceObject, "SellerName");
  const sellerProductReference = validateRequiredString(sourceObject, "SellerProductId");
  const name = validateRequiredString(sourceObject, "Name");
  const brand = validateOptionalString(sourceObject, "Brand");
  const category = validateOptionalString(sourceObject, "Category");
  const reasons = collectReasons([
    sellerName,
    sellerProductReference,
    name,
    brand,
    category
  ]);

  if (reasons.length > 0) {
    return {
      rejectedEntry: {
        ...(sellerName.ok ? { sellerName: sellerName.value } : {}),
        ...(sellerProductReference.ok ? { sellerProductReference: sellerProductReference.value } : {}),
        reasons
      }
    };
  }

  if (!sellerName.ok || !sellerProductReference.ok || !name.ok || !brand.ok || !category.ok) {
    throw new InputValidationInvariantError("Expected seller product entry fields to be valid.");
  }

  return {
    entry: {
      sellerName: sellerName.value,
      sellerProductReference: sellerProductReference.value,
      name: name.value,
      brand: brand.value,
      category: category.value
    }
  };
}

function validateRequiredString(
  sourceObject: Record<string, unknown>,
  field: string
): FieldValidation<string> {
  const value = sourceObject[field];

  if (value === undefined || value === null || value === "") {
    return {
      ok: false,
      reason: {
        field,
        code: "required",
        message: `${field} must be a non-empty string.`
      }
    };
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      reason: {
        field,
        code: "invalid_type",
        message: `${field} must be a string.`
      }
    };
  }

  return { ok: true, value };
}

function validateOptionalString(
  sourceObject: Record<string, unknown>,
  field: string
): FieldValidation<string | null> {
  const value = sourceObject[field];

  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      reason: {
        field,
        code: "invalid_type",
        message: `${field} must be a string or null.`
      }
    };
  }

  return { ok: true, value };
}

function collectReasons(
  validations: Array<FieldValidation<unknown>>
): RejectedSellerProductEntryReason[] {
  return validations.flatMap((validation) => validation.ok ? [] : [validation.reason]);
}

function sellerEntryIdempotencyKeyFromEntry(
  entry: SellerProductEntry
): SellerEntryIdempotencyKey {
  return {
    sellerName: entry.sellerName,
    sellerProductReference: entry.sellerProductReference
  };
}

function serializeSellerEntryIdempotencyKey(key: SellerEntryIdempotencyKey): string {
  return JSON.stringify([key.sellerName, key.sellerProductReference]);
}

function rejectDuplicateSellerEntry(entry: SellerProductEntry): RejectedSellerProductEntry {
  return {
    sellerName: entry.sellerName,
    sellerProductReference: entry.sellerProductReference,
    reasons: [
      {
        field: "SellerProductId",
        code: "duplicate_seller_entry",
        message: "SellerName + SellerProductId must be unique within the input file."
      }
    ]
  };
}

function toSourceEntryObject(sourceEntry: unknown): Record<string, unknown> {
  if (typeof sourceEntry === "object" && sourceEntry !== null && !Array.isArray(sourceEntry)) {
    return sourceEntry as Record<string, unknown>;
  }

  return {};
}
