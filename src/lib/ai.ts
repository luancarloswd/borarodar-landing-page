import { z } from "zod";
import { AppException } from "@/lib/errors";

const PARSE_DESCRIPTION_SYSTEM_PROMPT = `You are a route-planning assistant for a Brazilian travel app.
The user will describe a road trip in Portuguese (or another language).
Extract the structured route data and return ONLY valid JSON — no markdown, no explanation.

Return exactly this JSON schema:
{
  "origin": "city name",
  "destination": "city name",
  "waypoints": ["city name", ...],
  "returnToOrigin": true/false
}

Rules:
- "origin" is the starting city.
- "destination" is the final city. If the user says they return to the origin, set destination = origin and returnToOrigin = true.
- "waypoints" are intermediate stops in order, excluding origin and destination.
- If no waypoints are mentioned, return an empty array.
- Use the city names as written by the user (do not translate or abbreviate).
- returnToOrigin is true only if the user explicitly says they will return to the starting point.`;

export const parsedRouteSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  waypoints: z.array(z.string()),
  returnToOrigin: z.boolean(),
});

export type ParsedRoute = z.infer<typeof parsedRouteSchema>;

export async function parseRouteDescription(
  description: string
): Promise<ParsedRoute> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppException(
      "MISSING_API_KEY",
      500,
      "LLM API key is not configured. Set OPENAI_API_KEY in environment variables."
    );
  }

  let rawResponse: string;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PARSE_DESCRIPTION_SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        temperature: 0,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "unknown");
      throw new AppException(
        "AI_PARSE_FAILED",
        502,
        `LLM API returned ${res.status}: ${errorBody}`
      );
    }

    const json = await res.json();
    rawResponse = json.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    if (error instanceof AppException) throw error;
    throw new AppException(
      "AI_PARSE_FAILED",
      502,
      `LLM API call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawResponse);
  } catch {
    throw new AppException(
      "AI_PARSE_FAILED",
      502,
      "LLM returned invalid JSON",
      { rawResponse }
    );
  }

  const result = parsedRouteSchema.safeParse(parsed);
  if (!result.success) {
    throw new AppException(
      "AI_PARSE_FAILED",
      502,
      "LLM response does not match expected schema",
      { rawResponse, errors: result.error.flatten() }
    );
  }

  return result.data;
}
