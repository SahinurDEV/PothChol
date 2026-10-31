"use client";
import { useState } from "react";
import type { Analysis } from "@/lib/types";
const color = { high: "rgba(220,38,38,.45)", medium: "rgba(234,179,8,.45)", low: "rgba(34,197,94,.45)" };
export default function Home() {
  const [img, setImg] = useState<string>("/sample-sidewalk.jpg");
  const [data, setData] = useState<string | null>(null);
  const [dims, setDims] = useState({ width: 771, height: 1024 });
  const [ward, setWard] = useState("Ward 7 (Mirpur, DNCC)");
  const [res, setRes] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const onFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => { const u = r.result as string; setImg(u); setData(u); setRes(null); const im = new Image(); im.onload = () => setDims({ width: im.naturalWidth, height: im.naturalHeight }); im.src = u; }; r.readAsDataURL(f); };
  const toDataUrl = async (src: string) => { const b = await (await fetch(src)).blob(); return await new Promise<string>(ok => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(b); }); };
  const analyze = async () => { setBusy(true); const image = data ?? await toDataUrl(img); const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, ward, ...dims }) }); setRes(await r.json()); setBusy(false); };
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>পথচল · PothChol</h1>
      <p>ফুটপাতের ছবি দিন — বিপদ চিহ্নিত করুন, নিরাপদ পথ জানুন, ওয়ার্ডে রিপোর্ট পাঠান।</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} />
        <input value={ward} onChange={e => setWard(e.target.value)} style={{ padding: 6, minWidth: 220 }} />
        <button onClick={analyze} disabled={busy} style={{ padding: "8px 16px", background: "#047857", color: "#fff", border: 0, borderRadius: 6 }}>{busy ? "বিশ্লেষণ চলছে…" : "বিশ্লেষণ করুন"}</button>
      </div>
      <div style={{ position: "relative", marginTop: 16, width: 640, maxWidth: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="sidewalk" style={{ width: "100%", display: "block" }} />
        {res && <svg viewBox={`0 0 ${res.frame.w} ${res.frame.h}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
          {res.hazards.map(h => {
            const lx = h.box ? h.box[0] : h.polygon?.[0]?.[0] ?? 0, ly = h.box ? h.box[1] : h.polygon?.[0]?.[1] ?? 0;
            return <g key={h.id}>
              {h.path ? <path d={h.path} transform={h.pathTransform} fill={color[h.severity]} stroke="#111" strokeWidth={1} vectorEffect="non-scaling-stroke" fillRule="evenodd" />
                : <polygon points={(h.polygon || []).map(p => p.join(",")).join(" ")} fill={color[h.severity]} stroke="#111" strokeWidth={2} />}
              <text x={lx} y={Math.max(14, ly - 6)} fontSize={Math.max(14, res.frame.w / 40)} fill="#111">{h.labelBn}</text></g>;
          })}
        </svg>}
      </div>
      {res && <section>
        <p><small>Mode: {res.mode}{res.error ? ` (fallback: ${res.error})` : ""}{res.warnings?.length ? ` · warnings: ${res.warnings.join("; ")}` : ""}</small></p>
        <h2>বিপদসমূহ</h2>
        <ul>{res.hazards.map(h => <li key={h.id}>{h.labelBn} / {h.label} — {h.severity} ({Math.round(h.score * 100)}%)</li>)}</ul>
        <h2>নিরাপদ চলার পরিকল্পনা</h2><p>{res.planBn}</p><p><em>{res.planEn}</em></p>
        <h2>ওয়ার্ড রিপোর্ট</h2><pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 12, borderRadius: 6 }}>{res.wardReport}</pre>
        <button onClick={() => navigator.clipboard.writeText(res.wardReport)}>কপি করুন</button>
      </section>}
    </main>);
}
