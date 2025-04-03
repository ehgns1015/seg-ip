import { NextResponse } from "next/server";

export function createApiResponse<T>(data?: T, error?: string, status = 200) {
  return NextResponse.json(error ? { error } : data, { status });
}

export function handleApiError(error: unknown, message = "Server error") {
  console.error(`${message}:`, error);
  return createApiResponse(
    undefined, 
    error instanceof Error ? error.message : message, 
    500
  );
}