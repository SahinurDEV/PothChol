import { NextResponse } from "next/server";
import { mockAnalysis } from "@/lib/mock";
import { liveAnalysis } from "@/lib/meta";
export async function POST(req: Request) {
  const { image, ward } = await req.json();
  if (!process.env.MODEL_API_KEY || !image) return NextResponse.json(mockAnalysis(ward));
  try { return NextResponse.json(await liveAnalysis(image, ward)); }
  catch (e: any) { return NextResponse.json({ ...mockAnalysis(ward), error: String(e.message) }); }
}
