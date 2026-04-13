'use strict';

function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mix(a, b, t) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  return `rgb(${Math.round(pa.r * (1 - t) + pb.r * t)},${Math.round(pa.g * (1 - t) + pb.g * t)},${Math.round(pa.b * (1 - t) + pb.b * t)})`;
}

function lighten(hex, amt) {
  const p = hexToRgb(hex);
  return `rgb(${Math.min(255, p.r + Math.round((255 - p.r) * amt))},${Math.min(255, p.g + Math.round((255 - p.g) * amt))},${Math.min(255, p.b + Math.round((255 - p.b) * amt))})`;
}