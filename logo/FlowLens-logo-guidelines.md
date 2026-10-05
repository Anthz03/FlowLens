# FlowLens logo guidelines

**The idea:** an **F drawn as a process**. One path leaves the stem and branches into two nodes. It reads as the letter F and as a tiny flowchart.

## Files (`logo/final/`)
| Use | File |
|---|---|
| Default logo (website header, documents) | `flowlens-horizontal.svg` |
| Narrow / centred spaces | `flowlens-stacked.svg` |
| Symbol only (avatar, small spaces) | `flowlens-symbol.svg` |
| Below ~24 px (favicon, tiny UI) | `flowlens-symbol-small.svg` (heavier strokes) |
| Dark or indigo backgrounds | `flowlens-horizontal-on-dark.svg`, `flowlens-horizontal-white.svg`, `flowlens-symbol-white.svg` |
| One-colour printing, stamps, fax/photocopy | `*-black.svg` |
| App icon / social avatar | `flowlens-app-icon.svg` |
| Web icon set (favicon, PWA, Apple) | `web/` (also copied into `client/public/`) |
| Wordmark only | `flowlens-wordmark.svg` |

All files are solid shapes: no live text, no fonts needed. Regenerate everything with `python logo/src/build_logo.py`.

## Colour
| Name | HEX | RGB | CMYK (approx.) | Use |
|---|---|---|---|---|
| FlowLens Indigo | `#4F46E5` | 79 · 70 · 229 | 66 · 69 · 0 · 10 | The mark, buttons, key accents |
| Deep Ink | `#1E1B4B` | 30 · 27 · 75 | 60 · 64 · 0 · 71 | The wordmark, headlines |
| Soft Indigo | `#A5B4FC` | 165 · 180 · 252 | — | The mark on dark backgrounds |
| White | `#FFFFFF` | | | Reversed logo |

Contrast: Indigo on white **6.3:1**, white on Indigo **6.3:1**, Deep Ink on white **16:1**, Soft Indigo on Deep Ink **8:1** (all pass WCAG AA for text).
CMYK values are screen-to-print conversions; match by eye against a printed proof or Pantone book before a large print run.

## Clear space
Keep a margin of at least **one node diameter** (the width of one of the two round dots, about ¼ of the mark's height) free on every side.

## Minimum size
- Symbol: **16 px** (use the small cut below 24 px) / 6 mm in print.
- Horizontal logo: **100 px wide** / 25 mm in print.
- Stacked logo: **64 px wide**.

## Do
- Use the Indigo mark with the Deep Ink wordmark on white or very light backgrounds.
- Use the white or on-dark version on dark photos, indigo, or near-black backgrounds.
- Use the black version when only one ink is available.

## Don't
- Recolour the mark or wordmark outside the palette, or use a gradient.
- Stretch, rotate, outline, add shadows or effects.
- Move the nodes, change the arm lengths, or redraw the F.
- Retype "FlowLens" in another font. Use the supplied wordmark.
- Place the Indigo logo on a busy photo or on a similar blue or purple (use the white version).

## Typography
The wordmark is outlined from **Inter Bold** (SIL Open Font License, free for commercial use). In the product, use Inter or the system sans-serif for body text.

## Notes and limits
- Trademark: this has not been checked against trademark registers or reverse image search. Do that (and consult a professional) before relying on it commercially or registering it.
- The mark is a custom drawing, not traced from any existing logo, but similar-looking "F" marks may exist.
