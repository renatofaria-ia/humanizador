import { getTextDetail, updateTextDraft } from "@/lib/data";
import { TextControls } from "@/lib/types";
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

    return jsonOk(text);
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const controls = ((body.controls ?? {}) as Partial<TextControls>) ?? {};

    await updateTextDraft(id, {
      title: String(body.title ?? ""),
      originalText: String(body.original_text ?? ""),
      profileId: String(body.profile_id ?? ""),
      controls: {
        objetivo: String(controls.objetivo ?? ""),
        cta: String(controls.cta ?? ""),
        tom: (controls.tom ?? "consultivo") as TextControls["tom"],
        tamanho: (controls.tamanho ?? "medio") as TextControls["tamanho"],
        formalidade: (controls.formalidade ?? "media") as TextControls["formalidade"],
        usarEmojis: Boolean(controls.usarEmojis),
        usarHashtags: Boolean(controls.usarHashtags),
        primeiraPessoa: Boolean(controls.primeiraPessoa),
        nivelOusadia: Number(controls.nivelOusadia ?? 3),
        instrucoesExtras: String(controls.instrucoesExtras ?? ""),
      },
    });

    return jsonOk({ updated: true });
  } catch (error) {
    return jsonError(error, 400);
  }
}
