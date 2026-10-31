# পথচল · PothChol

**Bangla sidewalk hazard copilot for Dhaka.** Built for the **Meta Global AI Hackathon — Indie track, "Build for Your World"** (Oct 27 – Nov 4, 2026).

## Pitch
Dhaka's footpaths are a daily obstacle course: open manholes, potholes hidden under monsoon water, vendor stalls and construction debris push pedestrians into traffic. PothChol lets anyone snap a photo of a sidewalk and instantly get:
1. **Hazard masks** — every pothole, open drain, broken slab and obstruction segmented on the image.
2. **A safe-walking plan in Bangla & English** — plain-language guidance for kids, elders and wheelchair users.
3. **A ready-to-send ward report** — a formal Bangla letter to the ward councillor (DNCC/DSCC) listing the hazards.

## Models
| Step | Model | Via |
|---|---|---|
| Hazard segmentation (concept prompts: pothole, open manhole, vendor stall…) | **SAM 3.1** | `https://api.meta.ai/v1/segment` |
| Bilingual plan + ward report (vision + text) | **Muse Spark** | `https://api.meta.ai/v1/chat/completions` |

Without `MODEL_API_KEY` the app runs in **mock mode**: sample sidewalk image, fake masks and a canned Bangla summary — so judges can demo it offline.

## Run
```bash
npm install
cp .env.example .env.local   # optional: add MODEL_API_KEY for live mode
npm run dev                  # http://localhost:3000
```
Click **বিশ্লেষণ করুন** with the sample image (mock) or upload your own photo.

## Structure
- `app/page.tsx` — upload UI, mask overlay, plan & report
- `app/api/analyze/route.ts` — mock / live switch
- `lib/meta.ts` — SAM 3.1 + Muse Spark calls
- `lib/mock.ts` — mock data

Secrets are never committed; only `.env.example` is tracked.

MIT License.
