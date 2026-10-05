import { useEffect, useRef, useState } from 'react';

// Fades and lifts its content into view the first time it scrolls on screen.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} {...rest}>{children}</Tag>;
}

// Counts up to a number when it first appears. Non-numeric values are shown as they are.
export function CountUp({ value, duration = 800 }) {
  const target = typeof value === 'number' ? value : Number(value);
  const numeric = Number.isFinite(target) && String(value).trim() !== '';
  const [n, setN] = useState(numeric ? 0 : value);
  useEffect(() => {
    if (!numeric) { setN(value); return undefined; }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(target); return undefined; }
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{n}</>;
}
