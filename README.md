# 🛡️ Bundle Builder

✨ **Bundle Builder** is a data-driven React prototype of a multi-step security-system
bundle builder, paired with a **live-updating review panel** that stays in perfect sync
with every selection, quantity, and variant change.

Built for the Frontend Take-Home brief.
**Figma reference:** [Frontend Test — Figma](https://www.figma.com/design/JYf61etQVqeseX7oY5alGz/Frontend-Test-Figma?node-id=68-8088&p=f&t=0x9ibc7jylb2tW3X-0)

---

## 🚀 Highlights

- 🧩 **Data-driven catalog** – every product, plan, and step is JSON, not hardcoded per-product markup
- 🎯 **Per-variant quantities** – White ×2 and Black ×1 of the same camera tracked and reviewed independently
- 🔄 **Live-synced review panel** – totals, savings, and line items recompute instantly as selections change
- 💾 **Real persistence** – "Save for later" round-trips through `localStorage` and restores exactly on return
- 📱 **Responsive down to a phone** – a bespoke breakpoint schema, including a dedicated tablet-landscape layout
- 🎨 **Pixel-matched to Figma** – spacing, radii, states, and typography verified against the source design
- ♿ **Accessible by default** – focus-trapped modal, reduced-motion support, keyboard-navigable accordion

---

## 🧭 Overview

The app is a two-column shopping flow: a left-hand **builder** — a 4-step accordion
(Cameras → Plan → Sensors → Extra protection) — and a right-hand **review panel** that
reflects the configured system live. Nothing about a specific product, plan, or step is
hardcoded into a component; the entire catalog, plan tiers, shipping/guarantee/financing
copy, and the step configuration live in `/data/*.json` and are typed and loaded through
[`src/data/catalog.ts`](src/data/catalog.ts). Adding a new camera or a third plan tier is a
JSON edit, not a component change.

---

## 🧰 Tech Stack

| | |
|---|---|
| Framework | React 19 + TypeScript, built with Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| State | A single `useReducer` (no external state library) |
| Persistence | `localStorage`, defensively parsed |
| Fonts | General Sans (Fontshare) + self-hosted Gilroy ExtraBold — see [Typography](#-typography-decision) |
| Linting | `oxlint` |

No UI kit, no animation library, no CSS-in-JS — see [Assumptions & Tradeoffs](#-assumptions--tradeoffs) for why.

---

## 📥 Setup

```bash
git clone https://github.com/okste1234/bundle_builder.git
cd bundle_builder
npm install
```

### Development

```bash
npm run dev
```

Starts Vite's dev server at `http://localhost:5173` with HMR.

### Build

```bash
npm run build
```

Runs `tsc -b` (type-check, no emit) and then `vite build`, producing a production bundle in
`dist/`. The build is the source of truth for "does this actually compile" — `npm run dev`
will happily serve code with type errors, `npm run build` won't.

```bash
npm run preview   # serve the dist/ build locally, for a final sanity check
npm run lint       # oxlint
```

---

## 🏗️ Architecture

- **`data/`** — plain JSON: the product catalog (cameras/sensors/accessories), plan
  options, shipping/guarantee/financing info, the accordion step config, and the initial
  seed selections. `src/types/index.ts` defines the shape each file must conform to;
  `src/data/catalog.ts` loads and types all of it in one place.
- **`src/state/`** — see [State management](#-state-management).
- **`src/components/`** — presentational and product-agnostic: `ProductCard`,
  `VariantSelector`, `QuantityStepper`, `AccordionStep`, `PlanOptionCard`,
  `ReviewItem`/`ReviewSection`/`ReviewInfoRow`, `Price`, `Badge`. None of them import a
  specific product — they're driven entirely by props sourced from `data/`.
- **No modal/toast library.** `ConfirmationModal.tsx` is a hand-built dialog: portal-rendered,
  focus-trapped, closes on Escape/backdrop-click, restores focus to whatever opened it, and
  locks body scroll while open. `useToast.ts` backs a lighter-weight toast for "Save my
  system for later" — the two confirmations get UX weight proportional to how consequential
  the action is (placing an order vs. saving a draft).
- **Motion is CSS-only.** `Collapse.tsx` is a `grid-template-rows: 0fr → 1fr` transition (no
  JS height measurement, content stays mounted) and is the one primitive behind both the
  accordion and every review-line enter/exit. `usePrefersReducedMotion.ts` plus a blanket
  `prefers-reduced-motion` override in `index.css` collapse all of it to instant when the
  user has that preference — functionality is untouched either way, only the motion is.
- **One deliberate JS exception: viewport-drift compensation.** The accordion never scrolls
  to a destination (no `scrollIntoView`) — but a very tall step collapsing off-screen can
  still drag the step that just opened out of view as a side effect of normal document
  reflow. `BundleBuilder.tsx` runs a short `requestAnimationFrame` loop that cancels exactly
  that borrowed drift frame-by-frame, and bails out the instant the user starts scrolling by
  hand, so the interaction still reads as "the page rearranged itself" rather than "the page
  scrolled me somewhere."

---

## 🧠 State Management

One `useReducer` (`bundleReducer.ts`) holds the entire bundle:

```ts
{
  openStepId: string | null;
  planId: string | null;
  products: {
    [productId]: {
      selectedVariantId: string | null;
      quantities: { [variantId]: number };
    };
  };
}
```

`selectors.ts` derives everything else from that one source of truth — review line items,
per-category "N selected" counts, and order totals — so the builder cards, the review
panel, and the accordion headers can never drift out of sync with each other. There's no
separate "cart" object; the review panel is a pure projection of the same state the
product cards read and write.

---

## 🎛️ Variant & Quantity Approach

This was a highlighted interaction of this assessment, so it's worth spelling out the
model explicitly: **quantity is keyed by variant, not by product.**

```
products["wyze-cam-v4"] = {
  selectedVariantId: "white",
  quantities: { white: 2, black: 1 }   // grey never touched → absent, not 0
}
```

- The product card's stepper always reads/writes `quantities[selectedVariantId]`.
  Switching the selected color **never touches** `quantities` — it only changes which key
  the stepper is currently pointed at. Add 2 White, switch to Black, and the stepper reads
  whatever Black's count is (0, if untouched) — White's 2 is sitting untouched in the same
  object the whole time.
- The review panel does not care what's currently showing on the card. It iterates every
  entry in `quantities` with `qty > 0` and renders **one line per variant** — so White ×2
  and Black ×1 of the same product both show up as their own lines, simultaneously, even
  though the card can only ever display one variant's stepper at a time.
- The "N selected" count on each accordion header counts **distinct products** with at
  least one variant above zero — not variant-lines, and not total units. Two variants of
  the same camera selected still count as 1.
- A product's selected-state border (the highlighted card outline) reflects whether *any*
  variant has a quantity above zero, not just the currently-displayed one — so previewing
  Grey on a card that has 2 White in the bag still shows as selected.
- Variant-less products (the doorbell) use an internal default key instead of a real
  variant id, so the exact same stepper/selector code path handles both cases — no
  `if (hasVariants)` branching duplicated across components.

---

## 💾 Persistence

"Save my system for later" writes the full state object to `localStorage`
(`persistence.ts`); it is **not** autosaved on every change — persistence is tied
explicitly to that action, matching the brief's wording. On load, `loadSavedBundle()`
defensively parses whatever's there: malformed JSON, a missing field, or a stale
product/variant id from a since-edited catalog all fall back to sane defaults rather than
crashing, and a payload with no recognizable product entries is treated as no save at all.

One deliberate exception to "restore exactly as left": the brief also states plainly that
step 1 opens on load. If a shopper collapses every accordion step and saves in that state,
literally honoring both instructions is ambiguous — so the *system* (products, quantities,
variants, plan) is always restored byte-for-byte, but the *open accordion step* falls back
to the first step whenever the saved value is `null` or otherwise invalid. Collapsing every
step and reloading mid-session (no save in between) is unaffected — this fallback only
applies at the point of hydrating from a saved payload, not as a rule enforced during live
use. The reasoning is that which panel happens to be expanded is navigation state, not part
of "the shopper's configuration" the brief is asking to preserve.

---

## 📱 Responsive Behavior

Desktop matches the Figma reference at 1440px, and the layout is designed to stay usable
and coherent all the way down to a phone — not just "doesn't visually break."

Breakpoints are declared centrally in `index.css`'s `@theme` block rather than left at
Tailwind's defaults, because the design calls for a schema that doesn't line up with them
one-for-one:

| Breakpoint | Width | Role |
|---|---|---|
| *(base)* | `< 768px` | Mobile — single column throughout |
| `md` | `768px` | Tablet portrait |
| `lg` | `1024px` | Tablet landscape / small desktop — see below |
| `xl` | `1200px` | Standard desktop — the two-column layout locks in here |
| `2xl` | `1440px` | Wide desktop — matches the Figma frame exactly |

Two things worth calling out:

- **`lg` gets a genuinely different layout, not a scaled-down desktop one.** The design
  file includes an alternate "stacked" frame for this range — the product grid isn't a
  narrower version of the desktop 2-column grid, it wraps fixed-size cards; and the review
  panel splits into two side-by-side columns (line items on the left, guarantee/total/
  checkout on the right) instead of stacking vertically. Both are implemented as targeted
  `lg:`-only overrides that snap back to the standard layout at `xl`, rather than trying to
  make one fluid layout serve both intents.
- **A Tailwind v4 gotcha worth documenting**: overriding only `xl`/`2xl` in `@theme` while
  leaving `sm`/`md`/`lg` at their defaults causes Tailwind to emit the `xl` media query
  block *before* `lg`'s in the generated stylesheet — so an `lg:` utility can silently beat
  an `xl:` utility at 1200px+ instead of losing to it, because CSS cascade falls back to
  source order once specificity ties. All five breakpoints are declared explicitly, in
  ascending order, to avoid this.

From 1200px up, the two-column grid uses **fixed pixel tracks** (`768px` builder / `399px`
review), not `fr` units — so the product-card grid inside it sizes off a column that never
changes width as the viewport grows, and margins absorb the difference instead. Only the
outer max-width (`1440px`, matching the Figma frame) and the resulting centering margin
grow past that.

---

## 🔤 Typography Decision

The design specifies **Gilroy** (body/UI) and **TT Norms Pro** (Checkout button only) —
both commercial, neither redistributable. Gilroy's free tier is Light (300) and ExtraBold
(800) only; the type scale this design actually uses is Regular/Medium/SemiBold/Bold/
Italic, none of which are free weights. Rather than force a mismatched free weight onto
most of the UI's body text, the split is:

- **General Sans** (Fontshare, free for commercial use, self-hosted-eligible) covers
  Regular/Medium/SemiBold/Bold/Italic — everything the type scale actually calls for, and a
  closer geometric match to Gilroy than a generic system-font fallback.
- **Real Gilroy ExtraBold** (downloaded from the official free tier, self-hosted from
  `public/fonts/`) is used specifically where the design calls for **Bold** weight — the
  plan-name accent, the order total, the confirmation "Done" button — since ExtraBold is
  the closest authentic Gilroy weight to Bold, and these are the highest-visibility
  moments where using the real typeface is worth the (small) weight mismatch.
- TT Norms Pro has no free tier at all; the Checkout button inherits the same General Sans
  base as everything else rather than introducing a third font for one button.

---

## ⚖️ Assumptions & Tradeoffs

- **The Figma file only shows Step 1 expanded** — Steps 2–4 never appear open in the
  source design. Their content (the plan-selection cards, the extra-protection product
  grid) was built using the same visual language Step 1 establishes (card geometry,
  selected-state border, price treatment), not copied from a reference that doesn't exist.
- **Order totals are computed live**, not reproduced from the mock's static numbers — the
  source file's own numbers don't fully reconcile internally (a line item's displayed
  total doesn't always equal unit price × quantity), which makes sense for a static design
  comp but not for a build where totals must actually recompute as quantities change. The
  on-load total is therefore the mathematically correct figure for the seeded selections,
  not necessarily an exact string match to the mock.
- **A review line only gets a variant qualifier** (e.g. "Wyze Cam v4 (White)") when the
  same product has more than one variant simultaneously selected. With a single variant
  selected — the common case — the line reads exactly as the design shows it, and the
  qualifier appears only when it's actually needed to disambiguate two lines for the same
  product.
- **No backend.** The brief lists an API as a bonus, not a requirement, and a static JSON
  file is explicitly called out as sufficient. Adding a throwaway server here would mean
  two things to start instead of one when a "clean clone" is intended by the examiner, for
  a bonus item the brief doesn't weight — an API only pays for itself once there's real I/O
  it enables (auth, order writes, inventory), which is out of scope for a prototype. If
  this catalog ever needed real backend-served images at scale, a CDN with on-the-fly
  transforms (Cloudinary, Imgix, or similar) would be the natural next step over serving
  static files from `public/` — resizing/format-negotiating per breakpoint instead of
  shipping one fixed asset to every viewport.
- **No UI kit, animation library, or CSS-in-JS.** The actual surface area needing
  library-grade behavior is small — one modal, one collapse primitive, one toast — and a
  library like Radix or Headless UI earns its keep across a dozen primitives, not three,
  especially when Figma-matched spacing/states would mean overriding most of its styling
  anyway. `Collapse.tsx`'s entire job is animating a height, which CSS's
  `grid-template-rows: 0fr → 1fr` already does with zero runtime JS — pulling in
  Framer Motion or react-spring for the same result would ship real weight for nothing of this size.
  More importantly, this is a frontend skills assessment: hand-rolling the modal's focus
  trap, Escape/backdrop close, and focus restoration demonstrates understanding of *why*
  those pieces work, not just that they can be installed. The honest tradeoff, though: a
  battle-tested library would already cover edge cases a hand-rolled version might not —
  nested focus traps, portal stacking order, odd Safari `inert`/focus quirks — that only
  surface at larger scale than this prototype needs.
- **Variant swatch touch targets are ~26px**, below the ~44px guideline usually recommended
  for touch. This matches the design's specified size exactly; enlarging it is a deliberate
  design decision to make, not a bug to silently fix, so it was left matching the spec.

---

## 🚧 Incomplete & Known Gaps

- No automated test suite (unit or integration) — verification for this build was done by
  direct interactive testing in a live browser (variant/quantity sync in both directions,
  accordion state, persistence round-trips, responsive behavior across breakpoints) rather
  than an assertion suite. Given more time, the reducer and selectors are the highest-value
  place to start (they're pure functions with no DOM dependency).
- No CI pipeline — `npm run build` and `npm run lint` are both clean locally, but nothing
  currently enforces that on push.
- No error boundary around the tree — a render error in one card would currently take down
  more of the page than it needs to.
- Hover states aren't specified anywhere in the source Figma file, so anything hover-related
  in this build (button opacity/scale on press, swatch hover) is a reasonable default, not a
  reproduction of a design decision.
