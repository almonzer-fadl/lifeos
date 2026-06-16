import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "@/lib/validate";

export function validateBody<T extends z.ZodTypeAny>(schema: T, body: unknown) {
  const result = validate(schema, body);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Validation failed", details: result.errors },
        { status: 400 }
      ),
      data: null,
    };
  }
  return { error: null, data: result.data };
}
