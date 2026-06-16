export function logRequest(method: string, path: string, status: number, durationMs: number, error?: string) {
  const entry = {
    ts: new Date().toISOString(),
    method,
    path,
    status,
    durationMs,
    ...(error ? { error } : {}),
  };

  if (status >= 400) {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export function wrapHandler(
  method: string,
  path: string,
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const start = Date.now();
    try {
      const response = await handler(request);
      logRequest(method, path, response.status, Date.now() - start);
      return response;
    } catch (err) {
      logRequest(method, path, 500, Date.now() - start, String(err));
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
