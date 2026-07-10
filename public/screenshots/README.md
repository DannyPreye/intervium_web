# Landing page screenshots

These power the "See it in action" section (`src/components/landing/ProductShowcase.tsx`,
data in `src/lib/screenshots.ts`). Current files (1600×766 JPG, ~150–220 KB each):

| File | Screen |
| --- | --- |
| `mock-interview.jpg` | Live voice mock interview (shown large) |
| `concept-coach.jpg` | Concept Coach whiteboard |
| `resume-analyzer.jpg` | Resume analyzer / ATS score |
| `resume-builder.jpg` | Resume builder |

## To replace or add

- Capture at ~1910×915 (the app in dark mode), then compress to 1600px wide, e.g.:
  `ffmpeg -i shot.png -vf scale=1600:-1:flags=lanczos -q:v 3 out.jpg`
- Keep each **under ~250 KB** so the page stays fast.
- Edit `src/lib/screenshots.ts` to add/reorder/rename (first entry is the large hero).
- Each frame shows a branded placeholder until its image loads, so a missing file
  never shows a broken image.
