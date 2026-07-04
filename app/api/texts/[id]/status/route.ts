import { updateTextStatus } from "@/lib/data";
import { TextStatus } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    await updateTextStatus(id, {
      nextStatus: String(body.status ?? "rascunho") as TextStatus,
      publishedUrl:
        body.published_url === undefined ? undefined : String(body.published_url),
    });

    return jsonOk({ updated: true });
  } catch (error) {
    return jsonError(error, 400);
  }
}
