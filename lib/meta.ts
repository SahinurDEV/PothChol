import { Analysis, Hazard } from "./types";
const BASE = process.env.MODEL_API_BASE || "https://api.meta.ai/v1";
async function call(path: string, body: unknown) {
  const r = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${process.env.MODEL_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
export async function liveAnalysis(imageDataUrl: string, ward: string): Promise<Analysis> {
  // 1) SAM 3.1 concept-prompted segmentation
  const seg = await call("/segment", { model: process.env.SEGMENT_MODEL || "sam-3.1", image: imageDataUrl,
    prompts: ["pothole", "open manhole", "broken slab", "vendor stall blocking footpath", "construction debris", "exposed wire", "waterlogging"] });
  const hazards: Hazard[] = (seg.masks || []).map((m: any, i: number) => ({ id: `h${i+1}`, label: m.label, labelBn: m.label, severity: m.score > 0.85 ? "high" : "medium", score: m.score, polygon: m.polygon || [] }));
  // 2) Muse Spark bilingual plan + ward report
  const chat = await call("/chat/completions", { model: process.env.PLAN_MODEL || "muse-spark", response_format: { type: "json_object" },
    messages: [{ role: "system", content: "You are PothChol, a Dhaka sidewalk safety copilot. Reply JSON {planBn, planEn, wardReport, labelsBn:{[english]:bangla}}. wardReport is a formal Bangla letter to the ward councillor." },
      { role: "user", content: [{ type: "text", text: `Ward: ${ward}. Hazards: ${JSON.stringify(hazards.map(h => ({ label: h.label, score: h.score })))}` }, { type: "image_url", image_url: { url: imageDataUrl } }] }] });
  const out = JSON.parse(chat.choices[0].message.content);
  hazards.forEach(h => (h.labelBn = out.labelsBn?.[h.label] || h.label));
  return { mode: "live", hazards, planBn: out.planBn, planEn: out.planEn, wardReport: out.wardReport };
}
