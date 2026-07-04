import { getTextDetail, saveManualVersion } from "@/lib/data";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const text = await getTextDetail(id);

    if (!text) {
      return jsonError("Texto nao encontrado.", 404);
    }

    return jsonOk(text.versions);
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    await saveManualVersion(id, {
      textoFinal: String(body.texto_final ?? ""),
      notes: String(body.notes ?? ""),
    });

    return jsonOk({ created: true }, 201);
  } catch (error) {
    return jsonError(error, 400);
  }
}
