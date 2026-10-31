# পথচল · PothChol

**Bangla sidewalk hazard copilot for Dhaka.** Built for the **Meta Global AI Hackathon — Indie track, "Build for Your World"** (Oct 27 – Nov 4, 2026).

## Pitch
Dhaka's footpaths are a daily obstacle course: open manholes, potholes hidden under monsoon water, vendor stalls and construction debris push pedestrians into traffic. PothChol lets anyone snap a photo of a sidewalk and instantly get:
1. **Hazard masks** — every pothole, open drain, broken slab and obstruction segmented on the image.
2. **A safe-walking plan in Bangla & English** — plain-language guidance for kids, elders and wheelchair users.
3. **A ready-to-send ward report** — a formal Bangla letter to the ward councillor (DNCC/DSCC) listing the hazards.

## Models
All calls go to the Meta Model API, base URL `https://api.meta.ai/v1`, using the **Responses API** (`POST /v1/responses` with `{ model, input }`).

| Step | Model ID | Endpoint |
|---|---|---|
| Hazard segmentation (concept prompts: pothole, open manhole, vendor stall…) | `sam-3.1` (SAM 3.1) | `POST /v1/responses` (streamed, one concept per request) |
| Bilingual plan + ward report (vision + text) | `muse-spark-1.3` (Muse Spark) | `POST /v1/responses` |

Model IDs can be overridden via `SEGMENT_MODEL` / `PLAN_MODEL` in `.env.local`.

### How segmentation works ([SAM docs](https://dev.meta.ai/docs/sam/overview))
- `POST /v1/responses`, `model: "sam-3.1"`, `stream: true`, with a user message holding `input_text` (one short noun-phrase concept) and `input_image` (the uploaded photo as a data URL). See [segmenting](https://dev.meta.ai/docs/sam/segmenting).
- SAM accepts **one concept per request**, so PothChol sends six requests in parallel: `pothole`, `open manhole`, `broken paving slab`, `street vendor stall`, `construction debris`, `exposed electrical wire`. The masks are merged for the overlay.
- The streamed `output_text` uses SAM's special-token grammar (`<0f>id<|box;…|><|mask;…|>`, see [reading segmentation](https://dev.meta.ai/docs/sam/reading-segmentation)). It is parsed with [`@meta-sam/parser`](https://dev.meta.ai/docs/sam/client-libraries) `parseImageStream`, and masks are rendered as SVG paths via `decodeMaskToSVGPath`.
- If some concepts fail, the rest still render and the failures show as warnings. If all fail, or Muse Spark fails, the app falls back to mock data and shows the error.
- Needs Node `^20.17` or `>=22.9` (a requirement of `@meta-sam/parser`).

> **Billing:** Meta's Model API may require a payment card on your Meta billing account before the first call succeeds. Without one (or without `MODEL_API_KEY`) PothChol runs in mock mode.

**Mock mode:** without `MODEL_API_KEY` the app uses a sample sidewalk image, fake masks and a canned Bangla summary — so judges can demo it offline.

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
- `lib/meta.ts` — SAM 3.1 (streamed, per concept, `@meta-sam/parser`) + Muse Spark 1.3 calls via the `openai` SDK pointed at the Meta base URL
- `lib/mock.ts` — mock data

Secrets are never committed; only `.env.example` is tracked.

MIT License.
