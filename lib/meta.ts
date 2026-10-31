import OpenAI from "openai";
import { parseImageStream, recordsOfKind, decodeMaskToSVGPath } from "@meta-sam/parser";
import type { Analysis, Hazard } from "./types";

// Meta Model API — docs: https://dev.meta.ai/docs/sam/segmenting , /reading-segmentation , /client-libraries
const client = () => new OpenAI({ baseURL: process.env.MODEL_API_BASE || "https://api.meta.ai/v1", apiKey: process.env.MODEL_API_KEY });
export const SEGMENT_MODEL = process.env.SEGMENT_MODEL || "sam-3.1";
export const PLAN_MODEL = process.env.PLAN_MODEL || "muse-spark-1.3";

/** One short noun phrase per request (SAM concept prompts: no "and"/"or", negation, or spatial phrasing). */
export const CONCEPTS: { prompt: string; label: string; labelBn: string; base: "high" | "medium" }[] = [
  { prompt: "pothole", label: "Pothole", labelBn: "গর্ত", base: "high" },
  { prompt: "open manhole", label: "Open drain / manhole", labelBn: "খোলা ড্রেন / ম্যানহোল", base: "high" },
  { prompt: "broken paving slab", label: "Broken slab", labelBn: "ভাঙা স্ল্যাব", base: "medium" },
  { prompt: "street vendor stall", label: "Vendor stall", labelBn: "হকারের দোকান", base: "medium" },
  { prompt: "construction debris", label: "Debris", labelBn: "নির্মাণ ময়লা", base: "medium" },
  { prompt: "exposed electrical wire", label: "Exposed wire", labelBn: "খোলা বৈদ্যুতিক তার", base: "high" },
];

/** Run one streamed SAM 3.1 request for a single concept and convert records to hazards. */
async function segmentConcept(oa: OpenAI, image: string, c: (typeof CONCEPTS)[number], frame: { w: number; h: number }) {
  const stream = await oa.responses.create({
    model: SEGMENT_MODEL,
    stream: true,
    input: [{ type: "message", role: "user", content: [
      { type: "input_text", text: c.prompt },
      { type: "input_image", image_url: image, detail: "auto" },
    ] }],
    metadata: { include_confidence: "true" },
  } as any);
  const result = await parseImageStream(stream as unknown as AsyncIterable<{ type: string }>).finalResult;
  const boxes = new Map(recordsOfKind(result.records, "box").map(b => [b.objectId, b]));
  return recordsOfKind(result.records, "mask").map<Hazard>(m => {
    const b = boxes.get(m.objectId);
    const score = m.confidence ?? b?.confidence ?? 0.9;
    return {
      id: `${c.prompt}-${m.objectId}`, concept: c.prompt, label: c.label, labelBn: c.labelBn,
      severity: c.base === "high" ? (score >= 0.5 ? "high" : "medium") : score >= 0.8 ? "medium" : "low",
      score,
      path: decodeMaskToSVGPath(m.mask),
      // The mask raster covers only m.bounds (source pixels), not the whole frame.
      pathTransform: `translate(${m.bounds.left} ${m.bounds.top}) scale(${(m.bounds.right - m.bounds.left) / m.mask.width} ${(m.bounds.bottom - m.bounds.top) / m.mask.height})`,
      box: b ? [b.left, b.top, b.right, b.bottom] : undefined,
    };
  });
}

function outputText(res: any): string {
  if (typeof res.output_text === "string") return res.output_text;
  return (res.output || []).flatMap((o: any) => o.content || []).map((c: any) => c.text || "").join("");
}

export async function liveAnalysis(image: string, ward: string, frame: { w: number; h: number }): Promise<Analysis> {
  const oa = client();
  // 1) SAM 3.1 — one request per hazard concept, run in parallel, merged for the UI
  const settled = await Promise.allSettled(CONCEPTS.map(c => segmentConcept(oa, image, c, frame)));
  const hazards = settled.flatMap(s => (s.status === "fulfilled" ? s.value : []));
  const warnings = settled.flatMap((s, i) => (s.status === "rejected" ? [`${CONCEPTS[i].prompt}: ${String(s.reason?.message || s.reason).slice(0, 200)}`] : []));
  if (warnings.length === CONCEPTS.length) throw new Error(`SAM 3.1 failed for all concepts — ${warnings[0]}`);

  // 2) Muse Spark 1.3 — bilingual plan + ward report via Responses API
  const plan = await oa.responses.create({
    model: PLAN_MODEL,
    // Docs: https://dev.meta.ai/docs/reasoning — "low" is cheaper/faster for this formatting-style task; "none" is rejected by Muse Spark.
    reasoning: { effort: process.env.PLAN_REASONING_EFFORT || "low" },
    instructions: "You are PothChol, a Dhaka sidewalk safety copilot. Reply ONLY JSON {planBn, planEn, wardReport}. wardReport is a formal Bangla letter to the ward councillor.",
    input: [{ type: "message", role: "user", content: [
      { type: "input_text", text: `Ward: ${ward}. Detected hazards: ${JSON.stringify(hazards.map(h => ({ hazard: h.label, confidence: +h.score.toFixed(2), box: h.box })))}` },
      { type: "input_image", image_url: image, detail: "auto" },
    ] }],
  } as any);
  const out = JSON.parse(outputText(plan).replace(/^\s*```(json)?|```\s*$/g, "").trim());
  return { mode: "live", frame, hazards, planBn: out.planBn, planEn: out.planEn, wardReport: out.wardReport, warnings };
}
