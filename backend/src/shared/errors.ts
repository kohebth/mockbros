export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function notFound(message = "Resource not found") {
  return new HttpError(404, message);
}

export function badRequest(message = "Invalid request", details?: unknown) {
  return new HttpError(400, message, details);
}
