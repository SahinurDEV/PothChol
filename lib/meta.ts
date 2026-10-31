import { Analysis, Hazard } from "./types";

// Meta Model API — https://api.meta.ai/v1 (Responses API: POST /v1/responses { model, input })
const BASE = process.env.MODEL_API_BASE || "https://api.meta.ai/v1";
export const SEGMENT_MODEL = process.env.SEGMENT_MODEL || "sam-3.1";
export const PLAN_MODEL = process.env.PLAN_MODEL || "muse-spark-1.3";
const PROMPTS = ["pothole", "open manhole", "broken slab", "vendor stall blocking footpath", "construction debris", "exposed wire", "waterlogging"];

async function responses(body: Record<string, unknown>) {
  const r = await fetch(`${BASE}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MODEL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`/responses (${body.model}) ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

/** Extract concatenated output text from a Responses API result. */
function outputText(res: any): string {
  if (typeof res.output_text === "string") return res.output_text;
  return (res.output || []).flatMap((o: any) => o.content || []).map((c: any) => c.text || "").join("");
}

/** Best-effort mask extraction: the segmentation guide was not publicly reachable,
 *  so we accept structured mask items or a JSON text payload. Anything else -> throw -> mock fallback. */
function parseMasks(res: any): any[] {
  const items = (res.output || []).flatMap((o: any) => [o, ...(o.content || [])]);
  const structured = items.flatMap((c: any) => c.masks || c.segments || (c.type?.includes("mask") ? [c] : []));
  if (structured.length) return structured;
  const t = outputText(res).replace(/^```(json)?|```$/g, "").trim();
  const j = JSON.parse(t);
  return Array.isArray(j) ? j : j.masks || j.segments || [];
}

export async function liveAnalysis(imageDataUrl: string, ward: string): Promise<Analysis> {
  // 1) SAM 3.1 media segmentation via Responses API
  const seg = await responses({
    model: SEGMENT_MODEL,
    input: [{ role: "user", content: [
      { type: "input_image", image_url: imageDataUrl },
      { type: "input_text", text: `Segment these concepts: ${PROMPTS.join(", ")}. Return masks with label, score and polygon [[x,y],...] in a 640x420 frame.` },
    ] }],
  });
  const hazards: Hazard[] = parseMasks(seg).map((m: any, i: number) => {
    const score = Number(m.score ?? m.confidence ?? 0.8);
    return { id: `h${i + 1}`, label: m.label || m.concept || "hazard", labelBn: m.label || "বিপদ",
      severity: score > 0.85 ? "high" : score > 0.6 ? "medium" : "low", score, polygon: m.polygon || m.points || [] };
  });

  // 2) Muse Spark 1.3 bilingual plan + ward report via Responses API
  const plan = await responses({
    model: PLAN_MODEL,
    instructions: "You are PothChol, a Dhaka sidewalk safety copilot. Reply ONLY JSON {planBn, planEn, wardReport, labelsBn:{[english]:bangla}}. wardReport is a formal Bangla letter to the ward councillor.",
    input: [{ role: "user", content: [
      { type: "input_text", text: `Ward: ${ward}. Hazards: ${JSON.stringify(hazards.map(h => ({ label: h.label, score: h.score })))}` },
      { type: "input_image", image_url: imageDataUrl },
    ] }],
  });
  const out = JSON.parse(outputText(plan).replace(/^```(json)?|```$/g, "").trim());
  hazards.forEach(h => (h.labelBn = out.labelsBn?.[h.label] || h.labelBn));
  return { mode: "live", hazards, planBn: out.planBn, planEn: out.planEn, wardReport: out.wardReport };
}
