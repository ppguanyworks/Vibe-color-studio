import { converter, differenceEuclidean } from 'culori'
import { ok, resolve, type OKLCH } from './oklch'
import type { FlyExtractConfig } from './flyExtractConfig'
import { toleranceToMergeThreshold } from './flyExtractConfig'

const toOklch = converter('oklch')
const dE = differenceEuclidean('oklab')

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

interface Cluster {
  sum: { l: number; a: number; b: number }
  n: number
  rep: { mode: 'oklab'; l: number; a: number; b: number }
}

export interface ClusterResult {
  oklch: OKLCH
  hex: string
  histogram: number
  compositeWeight: number
  ratio: number
  filtered: boolean
  tweaked: boolean
}

export interface FlyExtractionResult {
  main: OKLCH
  kept: ClusterResult[]
  resultNum: number
}

function oklchFromOklab(rep: Cluster['rep']): OKLCH {
  const o = toOklch(rep)
  return { l: o.l, c: o.c ?? 0, h: Number.isNaN(o.h as number) ? 0 : (o.h ?? 0) }
}

function clusterPixels(data: Uint8ClampedArray, threshold: number): Cluster[] {
  const toOklab = converter('oklab')
  const clusters: Cluster[] = []

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 125) continue
    const lab = toOklab({ mode: 'rgb', r: data[i] / 255, g: data[i + 1] / 255, b: data[i + 2] / 255 })
    const px = { mode: 'oklab' as const, l: lab.l, a: lab.a ?? 0, b: lab.b ?? 0 }

    let best = -1
    let bd = Infinity
    for (let k = 0; k < clusters.length; k++) {
      const d = dE(clusters[k].rep, px)
      if (d < bd) {
        bd = d
        best = k
      }
    }
    if (best >= 0 && bd < threshold) {
      const cl = clusters[best]
      cl.sum.l += px.l
      cl.sum.a += px.a
      cl.sum.b += px.b
      cl.n++
      cl.rep = { mode: 'oklab', l: cl.sum.l / cl.n, a: cl.sum.a / cl.n, b: cl.sum.b / cl.n }
    } else {
      clusters.push({ sum: { l: px.l, a: px.a, b: px.b }, n: 1, rep: { mode: 'oklab', l: px.l, a: px.a, b: px.b } })
    }
  }

  return clusters
}

function capClusters(clusters: Cluster[], maxColors: number): Cluster[] {
  if (clusters.length <= maxColors) return clusters

  const list = [...clusters]
  while (list.length > maxColors) {
    let minIdx = 0
    for (let i = 1; i < list.length; i++) {
      if (list[i].n < list[minIdx].n) minIdx = i
    }
    const small = list[minIdx]
    list.splice(minIdx, 1)

    let nearIdx = 0
    let nearD = Infinity
    for (let i = 0; i < list.length; i++) {
      const d = dE(list[i].rep, small.rep)
      if (d < nearD) {
        nearD = d
        nearIdx = i
      }
    }
    const target = list[nearIdx]
    target.sum.l += small.sum.l
    target.sum.a += small.sum.a
    target.sum.b += small.sum.b
    target.n += small.n
    target.rep = {
      mode: 'oklab',
      l: target.sum.l / target.n,
      a: target.sum.a / target.n,
      b: target.sum.b / target.n,
    }
  }
  return list
}

function inOklchRange(c: OKLCH, cfg: FlyExtractConfig): boolean {
  return c.c >= cfg.chromaFrom && c.c <= cfg.chromaTo && c.l >= cfg.lightnessFrom && c.l <= cfg.lightnessTo
}

function tweakOklch(c: OKLCH, cfg: FlyExtractConfig): OKLCH {
  return {
    ...c,
    l: clamp(c.l, cfg.lightnessFrom, cfg.lightnessTo),
    c: clamp(c.c, cfg.chromaFrom, cfg.chromaTo),
  }
}

function applyFilterAndWeight(clusters: Cluster[], cfg: FlyExtractConfig): ClusterResult[] {
  const totalPixels = clusters.reduce((s, c) => s + c.n, 0) || 1
  const lightnessFactor = cfg.lightnessAddition / 100

  const raw: ClusterResult[] = clusters.map((cl) => {
    let oklch = oklchFromOklab(cl.rep)
    const ratio = cl.n / totalPixels
    const lightnessBoost = clamp(oklch.l, 0, 1)
    const compositeWeight = cl.n * (1 + lightnessFactor * lightnessBoost)

    return {
      oklch,
      hex: resolve(oklch).hex,
      histogram: cl.n,
      compositeWeight,
      ratio,
      filtered: false,
      tweaked: false,
    }
  })

  const kept: ClusterResult[] = []
  for (const item of raw) {
    if (inOklchRange(item.oklch, cfg)) {
      kept.push(item)
      continue
    }
    if (item.ratio > cfg.strategyThreshold) {
      const tweaked = tweakOklch(item.oklch, cfg)
      kept.push({
        ...item,
        oklch: tweaked,
        hex: resolve(tweaked).hex,
        tweaked: true,
      })
    }
  }

  return kept.sort((a, b) => b.compositeWeight - a.compositeWeight)
}

/** FlyMainColor-aligned extraction pipeline (Web approximation). */
export function extractFlyColors(data: Uint8ClampedArray, cfg: FlyExtractConfig): FlyExtractionResult {
  const threshold = toleranceToMergeThreshold(cfg.colorMergingTolerance)
  let clusters = clusterPixels(data, threshold)
  clusters = capClusters(clusters, cfg.maxColors)

  const kept = applyFilterAndWeight(clusters, cfg)
  const fallback = ok(0.5, 0.12, 255)

  const main = kept[0]?.oklch ?? fallback

  return {
    main,
    kept,
    resultNum: kept.length,
  }
}
