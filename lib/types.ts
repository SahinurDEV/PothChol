export type Hazard = { id: string; label: string; labelBn: string; severity: "low" | "medium" | "high"; score: number; polygon: [number, number][] };
export type Analysis = { mode: "mock" | "live"; hazards: Hazard[]; planBn: string; planEn: string; wardReport: string };
