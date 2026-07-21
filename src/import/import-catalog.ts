import type Database from "better-sqlite3";
import {
  cleanValue,
  classifyCatalogMatch,
  type CatalogProduct,
  type RejectedSellerProductEntry,
  type SellerProductEntry,
  type SellerProductLink
} from "../domain/index.js";
import {
  hasSellerProductLink,
  insertCatalogProduct,
  insertSellerProductLink,
  listCatalogProducts
} from "../db/index.js";
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
  | { kind: "unmatched"; entry: SellerProductEntry };

interface ImportPlan {
  importableEntries: ImportableEntry[];
  entriesRejected: RejectedSellerProductEntry[];
  sellerLinksSkipped: number;
}

interface ImportWriteCounts {
  productsInserted: number;
  productsMatched: number;
  sellerLinksCreated: number;
}

export function importCatalogProducts(
  db: Database.Database,
  entries: SellerProductEntry[]
): CatalogImportResult {
  const existingCatalogProducts = listCatalogProducts(db);
  const importPlan = planCatalogImport(db, entries, existingCatalogProducts);

  try {
    const writeCounts = writeImportableEntries(
      db,
      importPlan.importableEntries,
      existingCatalogProducts
    );

    return catalogImportResult({
      ...writeCounts,
      sellerLinksSkipped: importPlan.sellerLinksSkipped,
      entriesRejected: importPlan.entriesRejected
    });
  } catch (error) {
    throw new CatalogImportWriteError(error);
  }
}

function planCatalogImport(
  db: Database.Database,
  entries: SellerProductEntry[],
  existingCatalogProducts: CatalogProduct[]
): ImportPlan {
  const importableEntries: ImportableEntry[] = [];
  const entriesRejected: RejectedSellerProductEntry[] = [];
  let sellerLinksSkipped = 0;

  entries.forEach((entry) => {
    if (hasSellerProductLink(db, {
      sellerName: entry.sellerName,
      sellerProductReference: entry.sellerProductReference
    })) {
      sellerLinksSkipped += 1;
      return;
    }

    const catalogMatch = classifyCatalogMatch(entry, existingCatalogProducts);

    if (catalogMatch.kind === "ambiguous") {
      entriesRejected.push(rejectAmbiguousCatalogMatch(entry));
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

    importableEntries.push({ kind: "unmatched", entry });
  });

  return {
    importableEntries,
    entriesRejected,
    sellerLinksSkipped
  };
}

function writeImportableEntries(
  db: Database.Database,
  importableEntries: ImportableEntry[],
  existingCatalogProducts: CatalogProduct[]
): ImportWriteCounts {
  const counts: ImportWriteCounts = {
    productsInserted: 0,
    productsMatched: 0,
    sellerLinksCreated: 0
  };
  const importEntries = db.transaction((transactionEntries: ImportableEntry[]) => {
    let catalogProducts = existingCatalogProducts;

    const linkMatchedProduct = (
      catalogProductId: number,
      entry: SellerProductEntry
    ): void => {
      insertSellerProductLink(db, sellerProductLinkFromEntry(catalogProductId, entry));
      counts.productsMatched += 1;
      counts.sellerLinksCreated += 1;
    };

    transactionEntries.forEach((plannedEntry) => {
      if (plannedEntry.kind === "matched") {
        linkMatchedProduct(plannedEntry.catalogProduct.id, plannedEntry.entry);
        return;
      }

      const entry = plannedEntry.entry;
      const inTransactionMatch = classifyCatalogMatch(entry, catalogProducts);

      if (inTransactionMatch.kind === "matched") {
        linkMatchedProduct(inTransactionMatch.catalogProduct.id, entry);
        return;
      }

      const insertedProduct = insertCatalogProduct(db, catalogProductFromEntry(entry));
      insertSellerProductLink(db, sellerProductLinkFromEntry(insertedProduct.id, entry));
      counts.productsInserted += 1;
      counts.sellerLinksCreated += 1;
      catalogProducts = [...catalogProducts, insertedProduct];
    });
  });

  importEntries(importableEntries);

  return counts;
}

function catalogImportResult(
  partialResult: Partial<CatalogImportResult>
): CatalogImportResult {
  return {
    productsInserted: 0,
    productsMatched: 0,
    sellerLinksCreated: 0,
    sellerLinksSkipped: 0,
    entriesRejected: [],
    ...partialResult
  };
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
