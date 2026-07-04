import { NextResponse } from "next/server";

export function errorToMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Falha interna.";
}

export function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: errorToMessage(error),
    },
    { status },
  );
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status },
  );
}
