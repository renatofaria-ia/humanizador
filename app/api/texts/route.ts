import { createText, listTexts } from "@/lib/data";
import { ChannelKey, TextControls } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    return jsonOk(await listTexts());
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const controls = (body.controls ?? {}) as Partial<TextControls>;

    const id = await createText({
      title: String(body.title ?? ""),
      originalText: String(body.original_text ?? ""),
      profileId: String(body.profile_id ?? ""),
      channelKey: String(body.channel_key ?? "generico") as ChannelKey,
      controls,
    });

    return jsonOk({ id }, 201);
  } catch (error) {
    return jsonError(error, 400);
  }
}
