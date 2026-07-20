import { readFileSync } from "node:fs";
import { InputFileJsonError, InputFileReadError } from "./errors.js";
import type { ValidatedSellerProductInput } from "./model.js";
import { validateSellerProductInput } from "./validation.js";

export function parseSellerProductEntriesFromFile(
  inputPath: string
): ValidatedSellerProductInput {
  const contents = readInputFile(inputPath);
  return validateSellerProductInput(parseInputJson(inputPath, contents));
}

function readInputFile(inputPath: string): string {
  try {
    return readFileSync(inputPath, "utf8");
  } catch (error) {
    throw new InputFileReadError(inputPath, error);
  }
}

function parseInputJson(inputPath: string, contents: string): unknown {
  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    throw new InputFileJsonError(inputPath, error);
  }
}
