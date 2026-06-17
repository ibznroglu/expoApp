export interface OctagonParams {
  width: number;
  height: number;
  cut: number;
}

function clampCut(width: number, height: number, cut: number): number {
  const maxCut = Math.min(width, height) / 2;
  return Math.max(0, Math.min(cut, maxCut));
}

export function octagonPath({ width: W, height: H, cut }: OctagonParams): string {
  const C = clampCut(W, H, cut);
  return `M ${C},0 L ${W - C},0 L ${W},${C} L ${W},${H - C} L ${W - C},${H} L ${C},${H} L 0,${H - C} L 0,${C} Z`;
}

export function octagonInnerPath(
  { width: W, height: H, cut }: OctagonParams,
  border: number,
): string {
  const innerW = W - 2 * border;
  const innerH = H - 2 * border;
  const innerCut = clampCut(innerW, innerH, Math.max(0, cut - border));
  const o = border;
  return `M ${o + innerCut},${o} L ${o + innerW - innerCut},${o} L ${o + innerW},${o + innerCut} L ${o + innerW},${o + innerH - innerCut} L ${o + innerW - innerCut},${o + innerH} L ${o + innerCut},${o + innerH} L ${o},${o + innerH - innerCut} L ${o},${o + innerCut} Z`;
}
