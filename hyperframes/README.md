# Costco Q3 Fiscal 2026 — Animated Financial Graphics

Six [HyperFrames](https://github.com/heygen-com/hyperframes)-style animated
compositions ("write HTML, render video") built from Costco Wholesale
Corporation's third-quarter and year-to-date fiscal 2026 results, released
May 28, 2026 for the 13-week quarter ended May 10, 2026.

Open any `compositions/*/index.html` file directly in a browser to preview
the loop — each one autoplays and loops every 8 seconds. No build step or
dependencies are required to preview.

## Compositions

| # | File | Story |
|---|------|-------|
| 1 | `compositions/01-total-revenue/` | Total revenue reaches $70.53B, net sales up 11.6% YoY |
| 2 | `compositions/02-net-income-eps/` | Net income $2.19B and diluted EPS $4.93, both up ~15% |
| 3 | `compositions/03-membership-loyalty/` | 148.5M cardholders; 92.2% US/Canada and 89.7% worldwide renewal |
| 4 | `compositions/04-comparable-sales-growth/` | Comparable sales growth by region — US, Canada, Other International, Digitally-enabled |
| 5 | `compositions/05-membership-fee-income/` | Membership fee income $1.37B and 41.2M paid executive members |
| 6 | `compositions/06-fiscal-ytd-momentum/` | Year-to-date (36-week) net sales, net income, EPS, and warehouse count |

## Data sources

All figures are drawn from Costco's official Q3 & YTD fiscal 2026 press
release and contemporaneous reporting on it:

- [Costco Wholesale Corporation Reports Third Quarter and Year-To-Date Operating Results For Fiscal 2026](https://investor.costco.com/news/news-details/2026/Costco-Wholesale-Corporation-Reports-Third-Quarter-and-Year-To-Date-Operating-Results-For-Fiscal-2026/default.aspx) — Costco Investor Relations, May 28, 2026
- [Costco Q3 2026 net sales up 11.6% to $69.2B](https://www.stocktitan.net/news/COST/costco-wholesale-corporation-reports-third-quarter-and-year-to-date-ya9rfbnhnzg9.html) — StockTitan
- [Costco Q3 2026 earnings](https://www.cnbc.com/2026/05/28/costco-cost-q3-2026-earnings.html) — CNBC

Two figures used only as animation *start* values (never asserted as fact in
on-screen copy) are derived, not reported directly: prior-year 36-week net
sales (back-solved from the reported +9.6% YoY growth to $203.37B) and the
prior-year warehouse count (931 minus the 16 net new openings reported for
the period).

## Design system

All six compositions share one visual language so the set reads as a single
piece:

- **Colors** — Costco red `#E31837` and Costco blue `#003DA5` (the brand's
  hex values since 1997), plus a brighter on-dark blue `#3987e5` for data
  marks, against a near-black navy gradient background with a faint diagonal
  warehouse-stripe texture.
- **Type** — system sans-serif, black weight (900) for headline numbers,
  uppercase tracked labels for eyebrows/captions — no external font or CDN
  dependency, so every composition renders identically offline.
- **Layout** — fixed 1920×1080 canvas that scales to fit any viewport,
  identical eyebrow/wordmark header and source-cited footer with a six-dot
  page indicator on every scene.
- **Motion** — a small dependency-free timeline engine (inlined in each
  file, no GSAP/CDN) built on the native Web Animations API and
  `requestAnimationFrame`. Every animated value is driven by one clock, so
  each composition exposes `window.__hfSeek(ms)` for deterministic,
  frame-accurate scrubbing/rendering and `window.__hfPlay()` to resume
  autoplay — the same "paused, seekable timeline" model HyperFrames expects,
  implemented without a network dependency.
- **Categorical chart colors** (composition 4's four region bars) were
  checked with Anthropic's dataviz palette validator for CVD-safe contrast
  before use; every bar also carries a direct value label so identity never
  depends on color alone.

## Rendering to video with HyperFrames

These files were authored offline (this environment has no outbound access
to install `hyperframes` or fetch its docs/CLI), so they weren't run through
`hyperframes lint`/`render` here. To turn a composition into an MP4 once you
have network access:

```bash
npm install -D hyperframes
npx hyperframes render -c hyperframes/compositions/01-total-revenue/index.html \
  --output hyperframes/compositions/01-total-revenue/output.mp4
```

Repeat per composition (or loop over `compositions/*/index.html`). Each
`<html>` root carries `data-hyperframes-composition`, `data-duration-ms`,
and `data-fps` attributes; run `npx hyperframes lint` against a composition
first if the installed CLI expects additional scaffolding (e.g. a
`preview.html`/`DESIGN.md` pair) and adjust to match.
