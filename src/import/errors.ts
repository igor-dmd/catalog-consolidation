export class CatalogImportWriteError extends Error {
  constructor(cause: unknown) {
    super("Catalog import write transaction failed.", { cause });
    this.name = "CatalogImportWriteError";
  }
}
