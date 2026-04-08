import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseRouteDescription } from "@/lib/ai";
import { AppException } from "@/lib/errors";

const originalFetch = globalThis.fetch;

function mockFetchResponse(body: unknown, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

describe("parseRouteDescription", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key-123");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("throws MISSING_API_KEY when OPENAI_API_KEY is not set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(
      parseRouteDescription("De São Paulo para o Rio")
    ).rejects.toThrow(AppException);

    try {
      await parseRouteDescription("De São Paulo para o Rio");
    } catch (err) {
      expect(err).toBeInstanceOf(AppException);
      expect((err as AppException).code).toBe("MISSING_API_KEY");
      expect((err as AppException).statusCode).toBe(500);
    }
  });

  it("parses a valid LLM response", async () => {
    const llmResponse = {
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      waypoints: ["Paraty"],
      returnToOrigin: false,
    };

    mockFetchResponse({
      choices: [
        { message: { content: JSON.stringify(llmResponse) } },
      ],
    });

    const result = await parseRouteDescription(
      "Quero ir de São Paulo para o Rio passando por Paraty"
    );

    expect(result).toEqual(llmResponse);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("parses a response with empty waypoints", async () => {
    const llmResponse = {
      origin: "Belo Horizonte",
      destination: "Brasília",
      waypoints: [],
      returnToOrigin: false,
    };

    mockFetchResponse({
      choices: [
        { message: { content: JSON.stringify(llmResponse) } },
      ],
    });

    const result = await parseRouteDescription("De BH para Brasília");

    expect(result.waypoints).toEqual([]);
    expect(result.returnToOrigin).toBe(false);
  });

  it("throws AI_PARSE_FAILED when LLM returns non-200", async () => {
    mockFetchResponse({ error: "rate limited" }, 429);

    await expect(
      parseRouteDescription("qualquer coisa")
    ).rejects.toMatchObject({
      code: "AI_PARSE_FAILED",
      statusCode: 502,
    });
  });

  it("throws AI_PARSE_FAILED when LLM returns invalid JSON", async () => {
    mockFetchResponse({
      choices: [
        { message: { content: "This is not JSON at all" } },
      ],
    });

    await expect(
      parseRouteDescription("qualquer coisa")
    ).rejects.toMatchObject({
      code: "AI_PARSE_FAILED",
      statusCode: 502,
      message: "LLM returned invalid JSON",
    });
  });

  it("throws AI_PARSE_FAILED when LLM returns wrong schema", async () => {
    mockFetchResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({ foo: "bar" }),
          },
        },
      ],
    });

    await expect(
      parseRouteDescription("qualquer coisa")
    ).rejects.toMatchObject({
      code: "AI_PARSE_FAILED",
      statusCode: 502,
      message: "LLM response does not match expected schema",
    });
  });

  it("throws AI_PARSE_FAILED when fetch itself throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(
      parseRouteDescription("qualquer coisa")
    ).rejects.toMatchObject({
      code: "AI_PARSE_FAILED",
      statusCode: 502,
    });
  });

  it("sends correct headers and body to OpenAI", async () => {
    const llmResponse = {
      origin: "A",
      destination: "B",
      waypoints: [],
      returnToOrigin: false,
    };

    mockFetchResponse({
      choices: [
        { message: { content: JSON.stringify(llmResponse) } },
      ],
    });

    await parseRouteDescription("De A para B");

    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(options.method).toBe("POST");
    expect(options.headers["Authorization"]).toBe("Bearer test-key-123");

    const body = JSON.parse(options.body);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages).toHaveLength(2);
    expect(body.messages[1].content).toBe("De A para B");
  });
});
