import { SYMBOL_VIEWBOX, HORIZONTAL_VIEWBOX, MARK_PATHS, MARK_CIRCLES, WORDMARK_PATH } from './logoData.js';

const INDIGO = '#4F46E5';
const INK = '#1E1B4B';

function Mark({ color }) {
  return (
    <>
      {MARK_PATHS.map((d, i) => <path key={i} fill={color} d={d} />)}
      {MARK_CIRCLES.map(([cx, cy, r], i) => <circle key={i} fill={color} cx={cx} cy={cy} r={r} />)}
    </>
  );
}

// The "F" flow mark on its own (favicon-style use, avatars).
export function LogoMark({ className = 'h-8 w-8', color = INDIGO, title = 'FlowLens' }) {
  return <svg viewBox={SYMBOL_VIEWBOX} className={className} role="img" aria-label={title}><Mark color={color} /></svg>;
}

// Horizontal lockup: mark + FlowLens wordmark. Colours can be overridden for dark backgrounds.
export default function Logo({ className = 'h-8 w-auto', markColor = INDIGO, textColor = INK, title = 'FlowLens' }) {
  return (
    <svg viewBox={HORIZONTAL_VIEWBOX} className={className} role="img" aria-label={title}>
      <Mark color={markColor} />
      <path fill={textColor} d={WORDMARK_PATH} />
    </svg>
  );
}
