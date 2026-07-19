import { describe, expect, it } from "vitest";

describe("project scaffold", () => {
  it("runs Vitest in the Node test environment", () => {
    expect(process.versions.node).toBeTypeOf("string");
  });
});
