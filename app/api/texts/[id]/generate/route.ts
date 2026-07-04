import { generateVersionForText, insertGenerationError } from "@/lib/data";
import { jsonError, jsonOk } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const output = await generateVersionForText(
      id,
      String(body.notes ?? "Geracao via endpoint /generate."),
    );

    return jsonOk(output, 201);
  } catch (error) {
    try {
      const { id } = await params;
      await insertGenerationError(id, error instanceof Error ? error.message : "Falha interna.");
    } catch {}

    return jsonError(error, 500);
  }
}
