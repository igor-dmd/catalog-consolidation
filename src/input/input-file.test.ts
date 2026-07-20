import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { InputFileJsonError, InputFileReadError } from "./errors.js";
import { parseSellerProductEntriesFromFile } from "./input-file.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

describe("seller product input files", () => {
  it("fails before import when the input file cannot be read", () => {
    expect(() => parseSellerProductEntriesFromFile("/missing/products.json"))
      .toThrowError(
        expect.objectContaining({
        name: InputFileReadError.name,
        inputPath: "/missing/products.json"
        })
      );
  });

  it("fails before import when the input file contains malformed JSON", () => {
    const inputPath = join(fixturesDir, "malformed-products.json");

    expect(() => parseSellerProductEntriesFromFile(inputPath))
      .toThrowError(
        expect.objectContaining({
        name: InputFileJsonError.name,
        inputPath
        })
      );
  });
});
