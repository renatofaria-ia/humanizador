import { getProfile, updateProfile } from "@/lib/data";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await getProfile(id);

    if (!profile) {
      return jsonError("Perfil nao encontrado.", 404);
    }

    return jsonOk(profile);
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

    await updateProfile(id, {
      nome: body.nome === undefined ? undefined : String(body.nome),
      descricao_curta:
        body.descricao_curta === undefined ? undefined : String(body.descricao_curta),
      regras_de_voz:
        body.regras_de_voz === undefined ? undefined : String(body.regras_de_voz),
      evitar: body.evitar === undefined ? undefined : String(body.evitar),
      sempre_usar: body.sempre_usar === undefined ? undefined : String(body.sempre_usar),
      amostra_de_escrita:
        body.amostra_de_escrita === undefined ? undefined : String(body.amostra_de_escrita),
      nivel_firmeza:
        body.nivel_firmeza === undefined ? undefined : Number(body.nivel_firmeza),
      nivel_humor: body.nivel_humor === undefined ? undefined : Number(body.nivel_humor),
      observacoes: body.observacoes === undefined ? undefined : String(body.observacoes),
    });

    return jsonOk({ updated: true });
  } catch (error) {
    return jsonError(error, 400);
  }
}
