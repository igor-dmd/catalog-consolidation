export class InputFileReadError extends Error {
  constructor(public readonly inputPath: string, cause: unknown) {
    super(`Could not read input file: ${inputPath}`, { cause });
    this.name = InputFileReadError.name;
  }
}

export class InputFileJsonError extends Error {
  constructor(public readonly inputPath: string, cause: unknown) {
    super(`Input file is not valid JSON: ${inputPath}`, { cause });
    this.name = InputFileJsonError.name;
  }
}
