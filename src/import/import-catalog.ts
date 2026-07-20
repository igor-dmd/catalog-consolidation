import type Database from "better-sqlite3";
import {
  cleanValue,
  classifyCatalogMatch,
  type CatalogProduct,
  type SellerProductEntry,
  type SellerProductLink
} from "../domain/index.js";
import {
  hasSellerProductLink,
  insertCatalogProduct,
  insertSellerProductLink,
  listCatalogProducts
} from "../db/index.js";
import type { RejectedSellerProductEntry } from "../input/model.js";
import { CatalogImportWriteError } from "./errors.js";

export interface CatalogImportResult {
  productsInserted: number;
  productsMatched: number;
  sellerLinksCreated: number;
  sellerLinksSkipped: number;
  entriesRejected: RejectedSellerProductEntry[];
}

type ImportableEntry =
  | { kind: "matched"; entry: SellerProductEntry; catalogProduct: CatalogProduct }
  | { kind: "insert"; entry: SellerProductEntry };

export function importCatalogProducts(
  db: Database.Database,
  entries: SellerProductEntry[]
): CatalogImportResult {
  const result: CatalogImportResult = {
    productsInserted: 0,
    productsMatched: 0,
    sellerLinksCreated: 0,
    sellerLinksSkipped: 0,
    entriesRejected: []
  };
  const importableEntries: ImportableEntry[] = [];
  const existingCatalogProducts = listCatalogProducts(db);

  entries.forEach((entry) => {
    if (hasSellerProductLink(db, {
      sellerName: entry.sellerName,
      sellerProductReference: entry.sellerProductReference
    })) {
      result.sellerLinksSkipped += 1;
      return;
    }

    const catalogMatch = classifyCatalogMatch(entry, existingCatalogProducts);

    if (catalogMatch.kind === "ambiguous") {
      result.entriesRejected.push(rejectAmbiguousCatalogMatch(entry));
      return;
    }

    if (catalogMatch.kind === "matched") {
      importableEntries.push({
        kind: "matched",
        entry,
        catalogProduct: catalogMatch.catalogProduct
      });
      return;
    }

    importableEntries.push({ kind: "insert", entry });
  });

  if (result.entriesRejected.length > 0) {
    return result;
  }

  const importEntries = db.transaction((transactionEntries: ImportableEntry[]) => {
    let catalogProducts = existingCatalogProducts;

    transactionEntries.forEach((plannedEntry) => {
      if (plannedEntry.kind === "matched") {
        insertSellerProductLink(db, sellerProductLinkFromEntry(
          plannedEntry.catalogProduct.id,
          plannedEntry.entry
        ));
        result.productsMatched += 1;
        result.sellerLinksCreated += 1;
        return;
      }

      const entry = plannedEntry.entry;
      const inTransactionMatch = classifyCatalogMatch(entry, catalogProducts);

      if (inTransactionMatch.kind === "matched") {
        insertSellerProductLink(db, sellerProductLinkFromEntry(
          inTransactionMatch.catalogProduct.id,
          entry
        ));
        result.productsMatched += 1;
        result.sellerLinksCreated += 1;
        return;
      }

      const insertedProduct = insertCatalogProduct(db, catalogProductFromEntry(entry));
      insertSellerProductLink(db, sellerProductLinkFromEntry(insertedProduct.id, entry));
      result.productsInserted += 1;
      result.sellerLinksCreated += 1;
      catalogProducts = [...catalogProducts, insertedProduct];
    });
  });

  try {
    importEntries(importableEntries);
  } catch (error) {
    throw new CatalogImportWriteError(error);
  }

  return result;
}

function catalogProductFromEntry(entry: SellerProductEntry): Omit<CatalogProduct, "id"> {
  return {
    name: cleanValue(entry.name),
    brand: entry.brand === null ? null : cleanValue(entry.brand),
    category: entry.category === null ? null : cleanValue(entry.category)
  };
}

function sellerProductLinkFromEntry(
  catalogProductId: number,
  entry: SellerProductEntry
): SellerProductLink {
  return {
    catalogProductId,
    sellerName: entry.sellerName,
    sellerProductReference: entry.sellerProductReference
  };
}

function rejectAmbiguousCatalogMatch(entry: SellerProductEntry): RejectedSellerProductEntry {
  return {
    sellerName: entry.sellerName,
    sellerProductReference: entry.sellerProductReference,
    reasons: [
      {
        field: "Name+Brand",
        code: "ambiguous_match",
        message: "Seller product identity matches multiple catalog products."
      }
    ]
  };
}
