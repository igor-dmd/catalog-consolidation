import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createLegacyAssessmentSchema } from "../db/helpers.js";
import { runImportCli } from "./import.js";

describe("import CLI", () => {
  it("fails when --db is missing", () => {
    const io = createCliIo();

    const exitCode = runImportCli(["--input", "products.json"], io);

    expect(exitCode).toBe(1);
    expect(io.stdout).toEqual([]);
    expect(io.stderr).toEqual([
      "Missing required argument: --db"
    ]);
  });

  it("fails when --input is missing", () => {
    const io = createCliIo();

    const exitCode = runImportCli(["--db", "catalog.db"], io);

    expect(exitCode).toBe(1);
    expect(io.stdout).toEqual([]);
    expect(io.stderr).toEqual([
      "Missing required argument: --input"
    ]);
  });

  it("fails when the import file cannot be read", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "catalog-import-cli-"));
    const dbPath = join(tempDir, "catalog.db");
    const inputPath = join(tempDir, "missing-products.json");
    const io = createCliIo();

    const exitCode = runImportCli(["--db", dbPath, "--input", inputPath], io);

    expect(exitCode).toBe(1);
    expect(io.stdout).toEqual([]);
    expect(io.stderr).toEqual([
      `Could not read input file: ${inputPath}`
    ]);
  });

  it("fails when the import file contains malformed JSON", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "catalog-import-cli-"));
    const dbPath = join(tempDir, "catalog.db");
    const inputPath = join(tempDir, "malformed-products.json");
    writeFileSync(inputPath, "{ not json", "utf8");
    const io = createCliIo();

    const exitCode = runImportCli(["--db", dbPath, "--input", inputPath], io);

    expect(exitCode).toBe(1);
    expect(io.stdout).toEqual([]);
    expect(io.stderr).toEqual([
      `Input file is not valid JSON: ${inputPath}`
    ]);
  });

  it("runs migrations, imports products, and prints structured JSON", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "catalog-import-cli-"));
    const dbPath = join(tempDir, "catalog.db");
    const inputPath = join(tempDir, "products.json");
    const db = new Database(dbPath);

    try {
      createLegacyAssessmentSchema(db);
      db.prepare(`
        INSERT INTO Product (Name, Brand, Category)
        VALUES ('Camera Canon EOS R6', 'Canon', 'Photography')
      `).run();
    } finally {
      db.close();
    }

    writeFileSync(inputPath, JSON.stringify([
      {
        SellerName: "Camera Seller",
        Id: "camera-r6-001",
        Name: " camera   canon eos r6 ",
        Brand: " CANON ",
        Category: "Seller Photography"
      },
      {
        SellerName: "Cable Seller",
        Id: "cable-001",
        Name: " USB-C   Cable ",
        Brand: " Acme ",
        Category: " Accessories "
      },
      {
        SellerName: "Rejected Seller",
        Id: "missing-name-001",
        Brand: "Acme"
      }
    ]), "utf8");

    const io = createCliIo();

    const exitCode = runImportCli(["--db", dbPath, "--input", inputPath], io);

    expect(exitCode).toBe(0);
    expect(io.stderr).toEqual([]);
    expect(io.stdout).toHaveLength(1);
    expect(JSON.parse(io.stdout[0] ?? "")).toEqual({
      productsInserted: 1,
      productsMatched: 1,
      sellerLinksCreated: 2,
      sellerLinksSkipped: 0,
      entriesRejected: [
        {
          sellerName: "Rejected Seller",
          sellerProductReference: "missing-name-001",
          reasons: [
            {
              field: "Name",
              code: "required",
              message: "Name must be a non-empty string."
            }
          ]
        }
      ]
    });

    const verificationDb = new Database(dbPath, { readonly: true });

    try {
      expect(verificationDb.prepare(`
        SELECT Name, Brand, Category
        FROM Product
        ORDER BY Id
      `).all()).toEqual([
        {
          Name: "Camera Canon EOS R6",
          Brand: "Canon",
          Category: "Photography"
        },
        {
          Name: "USB-C Cable",
          Brand: "Acme",
          Category: "Accessories"
        }
      ]);
      expect(verificationDb.prepare(`
        SELECT ProductId, SellerName, SellerProductId
        FROM SellerProduct
        ORDER BY Id
      `).all()).toEqual([
        {
          ProductId: 1,
          SellerName: "Camera Seller",
          SellerProductId: "camera-r6-001"
        },
        {
          ProductId: 2,
          SellerName: "Cable Seller",
          SellerProductId: "cable-001"
        }
      ]);
    } finally {
      verificationDb.close();
    }

    const repeatedRunIo = createCliIo();

    const repeatedRunExitCode = runImportCli(["--db", dbPath, "--input", inputPath], repeatedRunIo);

    expect(repeatedRunExitCode).toBe(0);
    expect(repeatedRunIo.stderr).toEqual([]);
    expect(repeatedRunIo.stdout).toHaveLength(1);
    expect(JSON.parse(repeatedRunIo.stdout[0] ?? "")).toEqual({
      productsInserted: 0,
      productsMatched: 0,
      sellerLinksCreated: 0,
      sellerLinksSkipped: 2,
      entriesRejected: [
        {
          sellerName: "Rejected Seller",
          sellerProductReference: "missing-name-001",
          reasons: [
            {
              field: "Name",
              code: "required",
              message: "Name must be a non-empty string."
            }
          ]
        }
      ]
    });

    const repeatedRunVerificationDb = new Database(dbPath, { readonly: true });

    try {
      expect(repeatedRunVerificationDb.prepare("SELECT COUNT(*) AS count FROM Product").get()).toEqual({
        count: 2
      });
      expect(repeatedRunVerificationDb.prepare("SELECT COUNT(*) AS count FROM SellerProduct").get()).toEqual({
        count: 2
      });
    } finally {
      repeatedRunVerificationDb.close();
    }
  });
});

interface CapturedCliIo {
  stdout: string[];
  stderr: string[];
  writeStdout(message: string): void;
  writeStderr(message: string): void;
}

function createCliIo(): CapturedCliIo {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    stdout,
    stderr,
    writeStdout(message: string): void {
      stdout.push(message);
    },
    writeStderr(message: string): void {
      stderr.push(message);
    }
  };
}
