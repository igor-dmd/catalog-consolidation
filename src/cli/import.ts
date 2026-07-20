import Database from "better-sqlite3";
import { runCatalogMigrations } from "../db/index.js";
import { importCatalogProducts, type CatalogImportResult } from "../import/index.js";
import { parseSellerProductEntriesFromFile } from "../input/input-file.js";
import { CliArgumentError } from "./errors.js";

export interface CliIo {
  writeStdout(message: string): void;
  writeStderr(message: string): void;
}

interface ImportCliOptions {
  dbPath: string;
  inputPath: string;
}

export function runImportCli(argv: string[], io: CliIo = processIo): number {
  try {
    const options = parseImportCliOptions(argv);
    const input = parseSellerProductEntriesFromFile(options.inputPath);
    const db = new Database(options.dbPath);

    try {
      runCatalogMigrations(db);
      const importResult = importCatalogProducts(db, input.entries);
      io.writeStdout(JSON.stringify(importResultWithInputRejections(
        importResult,
        input.entriesRejected
      )));
    } finally {
      db.close();
    }

    return 0;
  } catch (error) {
    if (error instanceof CliArgumentError) {
      io.writeStderr(error.message);
      return 1;
    }

    throw error;
  }
}

function importResultWithInputRejections(
  importResult: CatalogImportResult,
  inputEntriesRejected: CatalogImportResult["entriesRejected"]
): CatalogImportResult {
  return {
    ...importResult,
    entriesRejected: [
      ...inputEntriesRejected,
      ...importResult.entriesRejected
    ]
  };
}

function parseImportCliOptions(argv: string[]): ImportCliOptions {
  const dbPath = valueAfterArgument(argv, "--db");
  const inputPath = valueAfterArgument(argv, "--input");

  if (dbPath === undefined) {
    throw new CliArgumentError("--db");
  }

  if (inputPath === undefined) {
    throw new CliArgumentError("--input");
  }

  return { dbPath, inputPath };
}

function valueAfterArgument(argv: string[], argumentName: string): string | undefined {
  const argumentIndex = argv.indexOf(argumentName);

  if (argumentIndex === -1) {
    return undefined;
  }

  return argv[argumentIndex + 1];
}

const processIo: CliIo = {
  writeStdout(message: string): void {
    process.stdout.write(`${message}\n`);
  },
  writeStderr(message: string): void {
    process.stderr.write(`${message}\n`);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runImportCli(process.argv.slice(2));
}
