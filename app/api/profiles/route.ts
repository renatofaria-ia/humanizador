import { createProfile, listProfiles } from "@/lib/data";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    return jsonOk(await listProfiles());
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    await createProfile({
      nome: String(body.nome ?? ""),
      descricao_curta: String(body.descricao_curta ?? ""),
      regras_de_voz: String(body.regras_de_voz ?? ""),
      evitar: String(body.evitar ?? ""),
      sempre_usar: String(body.sempre_usar ?? ""),
      amostra_de_escrita: String(body.amostra_de_escrita ?? ""),
      nivel_firmeza: Number(body.nivel_firmeza ?? 3),
      nivel_humor: Number(body.nivel_humor ?? 2),
      observacoes: String(body.observacoes ?? ""),
    });

    return jsonOk({ created: true }, 201);
  } catch (error) {
    return jsonError(error, 400);
  }
}
