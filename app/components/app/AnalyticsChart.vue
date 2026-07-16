<script setup lang="ts">
import type { AnalyticsSeriesPoint } from '~~/shared/types/api'

// Dependency-free daily chart: `views` as bars, `uniques` as an overlaid line.
// Rendered as inline SVG (viewBox + non-uniform scaling) so it stays responsive
// without measuring the DOM; the line uses a non-scaling stroke to stay crisp,
// and axis labels live in HTML so text is never distorted by the scaling.
const props = defineProps<{ series: AnalyticsSeriesPoint[] }>()

const W = 1000
const H = 300

const geo = computed(() => {
  const pts = props.series ?? []
  const n = pts.length
  const max = Math.max(1, ...pts.map(p => p.views), ...pts.map(p => p.uniques))
  const slotW = n > 0 ? W / n : W
  const barW = Math.min(slotW * 0.6, 46)
  const topPad = H * 0.08
  const plotH = H - topPad

  const bars = pts.map((p, i) => {
    const x0 = i * slotW
    const barH = (p.views / max) * plotH
    return {
      hitX: x0,
      slotW,
      barX: x0 + (slotW - barW) / 2,
      barW,
      barY: H - barH,
      barH,
      cx: x0 + slotW / 2,
      cy: H - (p.uniques / max) * plotH,
      point: p,
    }
  })

  const linePath = bars
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${b.cx.toFixed(1)} ${b.cy.toFixed(1)}`)
    .join(' ')

  // Baseline, mid, and top gridlines (value 0, max/2, max).
  const gridlines = [0, 0.5, 1].map(f => H - f * plotH)

  return { n, max, bars, linePath, gridlines }
})

/** `YYYY-MM-DD` -> `DD.MM` without timezone drift. */
function shortDay(date: string): string {
  const [, m, d] = date.split('-')
  return `${d}.${m}`
}

/** First / middle / last labels for the x-axis (avoids crowding). */
const xLabels = computed(() => {
  const pts = props.series ?? []
  if (pts.length === 0) return []
  if (pts.length <= 2) return pts.map(p => shortDay(p.date))
  return [pts[0]!, pts[Math.floor(pts.length / 2)]!, pts[pts.length - 1]!].map(p => shortDay(p.date))
})
</script>

<template>
  <div class="chart">
    <div class="mb-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 text-xs" style="color: var(--muted)">
        <span class="legend"><span class="legend-swatch legend-swatch--views" />Wyświetlenia</span>
        <span class="legend"><span class="legend-swatch legend-swatch--uniques" />Unikalni</span>
      </div>
      <span class="text-xs tabular-nums" style="color: var(--muted-soft)">max {{ formatCount(geo.max) }}</span>
    </div>

    <div v-if="geo.n === 0" class="flex h-40 items-center justify-center text-sm" style="color: var(--muted-soft)">
      Brak danych w tym okresie.
    </div>

    <template v-else>
      <div class="plot">
        <svg
          class="chart-svg"
          :viewBox="`0 0 ${W} ${H}`"
          preserveAspectRatio="none"
          role="img"
          aria-label="Dzienny wykres wyświetleń i użytkowników unikalnych"
        >
          <!-- gridlines -->
          <line
            v-for="(y, i) in geo.gridlines"
            :key="`g${i}`"
            class="grid-line"
            :x1="0" :x2="W" :y1="y" :y2="y"
            vector-effect="non-scaling-stroke"
          />

          <!-- views bars (+ full-slot hover hit area with native tooltip) -->
          <g v-for="(b, i) in geo.bars" :key="`b${i}`" class="day">
            <rect class="bar-hit" :x="b.hitX" :y="0" :width="b.slotW" :height="H">
              <title>{{ shortDay(b.point.date) }} — {{ formatCount(b.point.views) }} wyświetleń · {{ formatCount(b.point.uniques) }} unikalnych · {{ formatEngagement(b.point.avg_engagement_ms) }}</title>
            </rect>
            <rect class="bar" :x="b.barX" :y="b.barY" :width="b.barW" :height="b.barH" />
          </g>

          <!-- uniques line -->
          <path
            v-if="geo.n >= 2"
            class="uniques-line"
            :d="geo.linePath"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div class="mt-2 flex justify-between text-[11px] tabular-nums" style="color: var(--muted-soft)">
        <span v-for="(label, i) in xLabels" :key="`x${i}`">{{ label }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chart {
  --chart-bar: var(--ink);
  --chart-line: #b45309;
}
.dark .chart {
  --chart-line: #f4c5a8;
}

.plot {
  height: 240px;
}
@media (max-width: 640px) {
  .plot { height: 180px; }
}

.chart-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.grid-line {
  stroke: var(--hairline);
  stroke-width: 1;
}

.bar {
  fill: var(--chart-bar);
  opacity: 0.9;
  transition: opacity 0.15s ease;
}
.bar-hit {
  fill: transparent;
  cursor: default;
}
.day:hover .bar {
  opacity: 0.55;
}

.uniques-line {
  fill: none;
  stroke: var(--chart-line);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.legend-swatch--views {
  background: var(--chart-bar);
}
.legend-swatch--uniques {
  background: var(--chart-line);
}
</style>
