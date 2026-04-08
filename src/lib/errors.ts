export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "AI_PARSE_FAILED"
  | "GEOCODE_FAILED"
  | "ORS_ERROR"
  | "MISSING_API_KEY"
  | "INTERNAL_ERROR";

export class AppException extends Error {
  constructor(
    public readonly code: AppErrorCode,
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppException";
  }
}
