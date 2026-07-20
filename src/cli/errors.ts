export class CliArgumentError extends Error {
  constructor(public readonly argumentName: string) {
    super(`Missing required argument: ${argumentName}`);
    this.name = CliArgumentError.name;
  }
}
