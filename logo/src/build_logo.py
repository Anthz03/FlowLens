"""Generates the FlowLens logo files (solid-shape SVGs, no live text) into ../final.
Mark: an "F" drawn as a process - one path that branches into two nodes.
Wordmark: "FlowLens" outlined from Inter Bold (SIL Open Font License)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = Path(__file__).parent
OUT = HERE.parent / 'final'
OUT.mkdir(exist_ok=True)

INDIGO, INK, WHITE, SOFT = '#4F46E5', '#1E1B4B', '#FFFFFF', '#A5B4FC'

# ---- the mark (coordinates: stem centre x=96, bottom 204, top arm y=56, mid arm y=134) ----
def mark(color, sw=24, nr=22):
    """Returns SVG elements for the F mark as filled shapes. sw = stroke weight, nr = node radius."""
    h = sw / 2
    R = 20                      # centre-line corner radius
    ro, ri = R + h, R - h       # outer / inner corner radii
    x0, x1 = 96 - h, 96 + h     # stem edges
    ytop = 56
    stem = (f'M{x0:g} 204V{76:g}A{ro:g} {ro:g} 0 0 1 {96 + R:g} {ytop - h:g}H166V{ytop + h:g}H{96 + R:g}'
            f'A{ri:g} {ri:g} 0 0 0 {x1:g} {76:g}V204A{h:g} {h:g} 0 0 1 {x0:g} 204Z')
    mid = f'M96 {134 - h:g}H150V{134 + h:g}H96Z'
    return (f'<path fill="{color}" d="{stem}"/><path fill="{color}" d="{mid}"/>'
            f'<circle fill="{color}" cx="186" cy="56" r="{nr}"/><circle fill="{color}" cx="170" cy="134" r="{nr}"/>')

BBOX = (84, 34, 208, 216)       # x0, y0, x1, y1 of the standard mark
CX, CY = 146, 125

# ---- the wordmark ----
FONT = TTFont(HERE / 'inter-700.woff')
GS, CMAP, UPEM = FONT.getGlyphSet(), FONT.getBestCmap(), FONT['head'].unitsPerEm
KERN = {('w', 'L'): -34, ('F', 'l'): 10, ('o', 'w'): -10, ('L', 'e'): -8}   # optical pair tweaks (font units)
TRACK = -12                                                                  # tracking (font units)

def wordmark(text, size, x, baseline, color):
    """Outlines `text` at font size `size`, left edge x, returns (svg path element, end x)."""
    s, pen_x, parts = size / UPEM, 0, []
    for i, ch in enumerate(text):
        name = CMAP[ord(ch)]
        pen = SVGPathPen(GS)
        GS[name].draw(TransformPen(pen, (s, 0, 0, -s, x + pen_x * s, baseline)))
        parts.append(pen.getCommands())
        pen_x += GS[name].width + TRACK + (KERN.get((ch, text[i + 1]), 0) if i + 1 < len(text) else 0)
    return f'<path fill="{color}" d="{" ".join(parts)}"/>', x + (pen_x - TRACK) * s

def svg(vb, body, title):
    x, y, w, h = vb
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:g} {y:g} {w:g} {h:g}" role="img">'
            f'<title>{title}</title>{body}</svg>\n')

def save(name, content):
    (OUT / name).write_text(content, encoding='utf-8')
    print('wrote', name)

CAP = 1490 / UPEM               # Inter cap-height in em
# Symbol only: square canvas around the mark
SQ = (CX - 112, CY - 112 - 2, 224, 224)
for tag, col in (('', INDIGO), ('-black', '#111111'), ('-white', WHITE)):
    save(f'flowlens-symbol{tag}.svg', svg(SQ, mark(col), 'FlowLens logo'))
# Small-size cut: heavier strokes and nodes so it holds up at 16-24 px
save('flowlens-symbol-small.svg', svg(SQ, mark(INDIGO, sw=32, nr=27), 'FlowLens logo (small size)'))

# Horizontal lockup: cap height of the wordmark = 53% of the mark's height, centred on the mark
size = (BBOX[3] - BBOX[1]) * 0.53 / CAP
def horizontal(mcol, tcol):
    gap = 44
    word, end = wordmark('FlowLens', size, BBOX[2] + gap, CY + (size * CAP) / 2, tcol)
    pad = 26
    vb = (BBOX[0] - pad, BBOX[1] - pad, end - BBOX[0] + 2 * pad, BBOX[3] - BBOX[1] + 2 * pad)
    return svg(vb, mark(mcol) + word, 'FlowLens'), end
h, end_x = horizontal(INDIGO, INK)
save('flowlens-horizontal.svg', h)
save('flowlens-horizontal-black.svg', horizontal('#111111', '#111111')[0])
save('flowlens-horizontal-white.svg', horizontal(WHITE, WHITE)[0])
save('flowlens-horizontal-on-dark.svg', horizontal(SOFT, WHITE)[0])

# Stacked lockup: mark above, wordmark centred below
def stacked(mcol, tcol):
    ssize = size * 1.0
    word, end = wordmark('FlowLens', ssize, 0, 0, tcol)
    width = end
    mw = BBOX[2] - BBOX[0]
    top = BBOX[1]
    base = BBOX[3] + 36 + ssize * CAP
    word, end = wordmark('FlowLens', ssize, CX - width / 2, base, tcol)
    pad = 26
    left = min(BBOX[0], CX - width / 2) - pad
    right = max(BBOX[2], end) + pad
    return svg((left, top - pad, right - left, base - top + 2 * pad), mark(mcol) + word, 'FlowLens')
save('flowlens-stacked.svg', stacked(INDIGO, INK))
save('flowlens-stacked-black.svg', stacked('#111111', '#111111'))
save('flowlens-stacked-white.svg', stacked(WHITE, WHITE))

# Wordmark only
word, end = wordmark('FlowLens', size, 0, size * CAP, INK)
save('flowlens-wordmark.svg', svg((-20, -20, end + 40, size * CAP + 40 + size * 0.03), word, 'FlowLens'))

# App icon: indigo tile, white mark (mark box 62% of tile)
sc = 512 * 0.60 / (BBOX[3] - BBOX[1])
tile = (f'<rect width="512" height="512" rx="112" fill="{INDIGO}"/>'
        f'<g transform="translate({256 - CX * sc:g} {256 - CY * sc - 4:g}) scale({sc:g})">{mark(WHITE, sw=26, nr=23)}</g>')
save('flowlens-app-icon.svg', svg((0, 0, 512, 512), tile, 'FlowLens app icon'))

# Component data for the React app
(OUT / 'logo-data.json').write_text(
    __import__('json').dumps({'viewBox': list(SQ), 'bbox': BBOX, 'wordmarkSize': size, 'wordEndX': end_x}), encoding='utf-8')


# ---- React app data (client/src/components/logoData.js), generated from the SVGs above ----
import json, re
_sym = (OUT / 'flowlens-symbol.svg').read_text(encoding='utf-8')
_hor = (OUT / 'flowlens-horizontal.svg').read_text(encoding='utf-8')
_paths = re.findall(r'<path fill="#[0-9A-Fa-f]+" d="([^"]+)"', _sym)
_word = re.findall(r'<path fill="#[0-9A-Fa-f]+" d="([^"]+)"', _hor)[-1]
_circles = [[int(v) for v in c] for c in re.findall(r'<circle fill="#[0-9A-Fa-f]+" cx="(\d+)" cy="(\d+)" r="(\d+)"', _sym)]
_js = ('// Generated by logo/src/build_logo.py - do not edit by hand.\n'
       f"export const SYMBOL_VIEWBOX = '{re.search(r'viewBox=\"([^\"]+)\"', _sym).group(1)}';\n"
       f"export const HORIZONTAL_VIEWBOX = '{re.search(r'viewBox=\"([^\"]+)\"', _hor).group(1)}';\n"
       f'export const MARK_PATHS = {json.dumps(_paths)};\n'
       f'export const MARK_CIRCLES = {json.dumps(_circles)};\n'
       f"export const WORDMARK_PATH = '{_word}';\n")
(HERE.parent.parent / 'client/src/components/logoData.js').write_text(_js, encoding='utf-8')
print('wrote client/src/components/logoData.js')
