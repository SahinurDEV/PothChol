export type Hazard = {
  id: string; concept: string; label: string; labelBn: string;
  severity: "low" | "medium" | "high"; score: number;
  polygon?: [number, number][];            // mock masks (frame coords)
  path?: string; pathScale?: [number, number]; // SAM mask as SVG path (mask px) + scale to frame
  box?: [number, number, number, number];   // left, top, right, bottom (frame px)
};
export type Analysis = { mode: "mock" | "live"; frame: { w: number; h: number }; hazards: Hazard[]; planBn: string; planEn: string; wardReport: string; error?: string; warnings?: string[] };
