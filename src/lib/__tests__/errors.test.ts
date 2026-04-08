import { describe, it, expect } from "vitest";
import { AppException } from "@/lib/errors";

describe("AppException", () => {
  it("creates an exception with all properties", () => {
    const err = new AppException("AI_PARSE_FAILED", 502, "LLM failed", {
      raw: "bad",
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppException);
    expect(err.code).toBe("AI_PARSE_FAILED");
    expect(err.statusCode).toBe(502);
    expect(err.message).toBe("LLM failed");
    expect(err.details).toEqual({ raw: "bad" });
    expect(err.name).toBe("AppException");
  });

  it("creates an exception without details", () => {
    const err = new AppException("INTERNAL_ERROR", 500, "Something broke");

    expect(err.details).toBeUndefined();
    expect(err.code).toBe("INTERNAL_ERROR");
  });

  it("supports all error codes", () => {
    const codes = [
      "VALIDATION_ERROR",
      "AI_PARSE_FAILED",
      "GEOCODE_FAILED",
      "ORS_ERROR",
      "MISSING_API_KEY",
      "INTERNAL_ERROR",
    ] as const;

    for (const code of codes) {
      const err = new AppException(code, 400, "test");
      expect(err.code).toBe(code);
    }
  });
});
