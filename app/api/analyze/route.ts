import { NextResponse } from "next/server";
import { mockAnalysis } from "@/lib/mock";
import { liveAnalysis } from "@/lib/meta";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const { image, ward, width, height } = await req.json();
  if (!process.env.MODEL_API_KEY || !image) return NextResponse.json(mockAnalysis(ward));
  try { return NextResponse.json(await liveAnalysis(image, ward, { w: width || 640, h: height || 420 })); }
  catch (e: any) { return NextResponse.json({ ...mockAnalysis(ward), error: String(e?.message || e) }); }
}
