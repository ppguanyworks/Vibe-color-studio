# Vibe Color Studio · 项目上下文文档

> **用途：** 后续迭代、修 bug、调参、接需求时的**单一事实源**。  
> 给人和 AI 读：开新对话时 `@docs/PROJECT_REFERENCE.md` 即可恢复项目上下文。  
> **路径：** `vibe-color-studio/` · **最后同步：** 2026-06

---

## 0. 30 秒读懂

| 项 | 内容 |
|----|------|
| **是什么** | 移动端 Aurora 动态渐变背景生成器（纯前端） |
| **输入** | HEX 主色 **或** 上传图片（Fly 取色） |
| **输出** | 5 光斑渐变 + 手机预览 + CSS / JSON / PNG 导出 |
| **核心函数** | `generateAurora()` ← `useStudio` 状态 |
| **参数真源** | `src/color/aurora.ts` → `BLOB_PROFILES` |
| **默认模式** | `inputMode: 'image'`，`lightnessId: 'dark'` |

---

## 1. 为什么要做

**场景：** TikTok / 音乐 Feed、活动页等需要以品牌主色为锚点的大面积**动态渐变底**，并与 Tab 栏、内容区形成明暗层次。

**痛点：** Figma 手工铺渐变 → 开发 CSS 复刻易漂移；封面图取色与客户端 Fly 不一致；黄绿等高感知色在 screen 混合下过亮；主色光斑边缘易生硬。

**本工具：** 输入一个色或一张图 → 参数化 5 光斑 → 实时预览 → 可导出落地资产。

---

## 2. 界面与数据流

```
用户操作 (InspectorPanel / BlobLayoutEditor / LightnessTabs)
        ↓
useStudio (zustand) — seedH/C, anchorOklch, blobAnchors, richness, …
        ↓
App.tsx useMemo → generateAurora(params) → AuroraResult
        ↓
PhonePreview (渲染) · ExportDrawer (CSS/JSON) · renderBackgroundImage (PNG)
```

**三栏布局：**

| 区域 | 组件 | 职责 |
|------|------|------|
| 左 300px | `InspectorPanel` | 输入、提取主色、渐变滑块 |
| 左 300px | `BlobLayoutEditor` | 5 光斑锚点拖拽（预览用真实 gradCss） |
| 中 | `PreviewStage` | 明度 Tab + 手机框 + 对比度条 |
| 右 | `ExportDrawer` | CSS / 静态 / JSON + PNG |

**渲染链：** `App.tsx` 是唯一把 store 接到 `generateAurora` 的地方；改参数默认值看 `useStudio.ts`，改生成逻辑看 `aurora.ts`。

---

## 3. 技术栈与目录

```
vibe-color-studio/
├── src/
│   ├── App.tsx                 # store → aurora → 三栏
│   ├── store/useStudio.ts      # 全局状态、图片加载、取色写回
│   ├── color/
│   │   ├── aurora.ts           # ★ 光斑 profile、颜色推导、对比度
│   │   ├── seedColor.ts        # HEX↔HSL/OKLCH、Figma 对齐色相
│   │   ├── flyExtract.ts       # 图片 OKLab 聚类
│   │   ├── flyExtractConfig.ts # Fly 容差映射
│   │   ├── quantize.ts         # extractFromImage 入口
│   │   ├── blobLayout.ts       # 锚点、DEFAULT_BLOB_ANCHORS、size
│   │   ├── blobGradient.ts     # gradCss、blur 常量、Canvas 停点
│   │   └── oklch.ts            # resolve、对比度
│   ├── presets/lightness.ts    # dark / light 预设
│   ├── components/             # UI
│   ├── export/                 # generators.ts、renderBackgroundImage.ts
│   └── styles/aurora-keyframes.css
└── docs/PROJECT_REFERENCE.md   # 本文档
```

**依赖：** Vite 8 · React 19 · Tailwind 4 · culori · zustand · html-to-image

**运行：**

```bash
cd vibe-color-studio && npm install && npm run dev
# http://localhost:5173 （勿用 127.0.0.1 若 IPv6 -only）
```

---

## 4. 状态默认值（useStudio）

| 字段 | 默认 | 说明 |
|------|------|------|
| `inputMode` | `'image'` | 切到 hex 会清 `lastExtraction` |
| `hex` | `#4A6CF7` | **图片模式下 UI 不应用此值展示主色** |
| `mergeSimilar` | `0.4` | → Fly tolerance 4 |
| `richness` | `0.4` | 丰富度 |
| `speed` | `1` | 1.0× ≈ 旧版 0.8×（`SPEED_BASE=0.8`） |
| `luminance` | `0` | 整体明度 ±1 → OKLCH L ±0.38 |
| `lightnessId` | `'dark'` | |
| `blobAnchors` | 见 `blobLayout.ts` | 5 点：TL/TR/BL/BR/上中 |

**图片取色写回：** `loadImage` / `setMerge` → `applyExtractedMain()` 更新 `seedH`、`seedC`、`anchorOklch`、`anchorHsl`、`palette`、`lastExtraction`。**不更新 `hex` 字段。**

**Inspector 主色展示：** 图片模式必须用 `palette[0].hex` / `anchorOklch`，不能用 store 里的 `hex`（曾因此出现色块与 H/C 数值不一致的 bug）。

---

## 5. 色彩规则（迭代时最常改）

### 5.1 色彩空间分工

| 用途 | 空间 |
|------|------|
| 计算、存储 blob 色 | OKLCH |
| UI 展示色相、Figma 对齐 | **HSL 的 H**（`seedH`） |
| 主色光斑 (profile 0) | **锁定** `anchorOklch`（来自 HEX 或提取），不做 hueK |
| 副色光斑 (1–4) | `seedH + hueK×ΔHmax` → `oklchHueFromHsl()` |
| Dark 合成 | `mix-blend-mode: screen` |
| Light 合成 | `multiply` |

### 5.2 副色推导（richness = r）

```
ΔHmax = 3 + r × 53
ΔCmax = r × 0.14
L_blob = lerp(blobL[0], blobL[1], lT)   // dark: [0.17, 0.44]
L_final = clamp(L_blob + luminance×0.38 + ygShift, 0.03, 0.99)
C = clamp(seedC + chromaK×ΔCmax, 0.02, 0.20)
```

### 5.3 当前 BLOB_PROFILES（`aurora.ts`）

| id | 标签 | size | lT | hueK | chromaK | softEdge | blur |
|----|------|------|-----|------|---------|----------|------|
| 0 | 主色 | 125% | — | — | — | ✓ | 48px |
| 1 | 右上 | 150% | 0.56 | −0.95 | −0.55 | | 34px |
| 2 | 左下 | 150% | 0.12 | +0.55 | −0.65 | | 34px |
| 3 | 右下 | 150% | 0 | +0.30 | −0.90 | | 34px |
| 4 | 上中 | 125% | 0.48 | −0.40 | +0.35 | | 34px |

profile 0 的 `lT/hueK/chromaK` **不参与颜色计算**；仅 size / softEdge / blur 生效。

**丰富度 0.4 时副色近似偏移：** 右上 ΔH≈−23° · 左下 ≈+30° · 右下 ≈+16° · 上中 ≈−10°

### 5.4 黄绿感知亮度补偿（`yellowGreenLShift`）

- HSL **38°–152°**，峰值 **92°**，最大 **ΔL = −0.05**
- 仅 **profile 0（主色）** 与 **profile 4（上中）**
- 原因：黄绿在 screen 混合下比 OKLCH L 看起来更亮

### 5.5 主色边缘融合（`blobGradient.ts`）

- `softEdge: true` → 四段 radial-gradient（0% → 30% → 52% → 92% 透明）
- 主色 blur 48px，呼吸动画 48–56px（`--blob-blur` CSS 变量）
- 其他光斑：单段 0→70% 透明，blur 34px

### 5.6 对比度

- 目标 ≥ **4.6:1**（`CONTRAST_TARGET`）
- `enforceContrast` **只压 base 底色**，不压亮 blob（避免把高光光斑压暗）
- 展示：底色 + 各 blob 停靠点中最差 WCAG + APCA Lc

---

## 6. 图片取色（Fly 子集）

**入口：** `quantize.ts` → `flyExtract.ts`

1. 缩图 max 96px  
2. OKLab 聚类 + 容差合并（`mergeSimilar×10` → tolerance）  
3. cap 16 色 → 权重排序 → OKLCH filter/tweak  
4. UI 展示 palette 前 6 色  

**已对齐（部分）：** OKLab 聚类、容差、cap≤16、compositeWeight、OKLCH tweak  

**未对齐：** 区域裁剪、RGB565、Native SDK、完整 Fly 策略  

**配置真源：** `flyExtractConfig.ts` · `FLY_EXTRACT_DEFAULTS`

---

## 7. 动效

| 光斑 | keyframe | 基础周期 | delay |
|------|----------|----------|-------|
| 0 主色 | float1 | 9000ms | −800ms |
| 1 右上 | float2 | 14000ms | −3200ms |
| 2 左下 | float3 | 18000ms | −5600ms |
| 3 右下 | float4 | 23000ms | −2100ms |
| 4 上中 | float5 | 27000ms | −4400ms |

- 路径：Lissajous 式 5 关键点，`aurora-keyframes.css`（导出 CSS 通过 `?raw` 同源）
- 实际周期：`durationMs / (speed × 0.8)`
- 主色额外：`aurora-breathe` 14s blur 呼吸
- blob 按 **OKLCH L 升序** 排列 DOM（暗的先画，screen 混合时亮部叠上）

---

## 8. 导出

| 格式 | 实现 | 注意 |
|------|------|------|
| CSS | `export/generators.ts` | 含 keyframes、每 blob gradCss/blur/delay |
| 静态 | 固定 anchor 位置的 radial 叠层 | 无动画 |
| JSON | params + blobs + 可选 extraction | 图片模式带 Fly meta |
| PNG | `html-to-image` 截 `[data-aurora-export-root]` | 失败回退 Canvas（可能与 live 帧略有差） |

改预览样式时，**同步检查** CSS 导出与 PNG 路径。

---

## 9. 已做迭代决策（避免重复讨论）

| 决策 | 结论 |
|------|------|
| 光斑数量 | 固定 5，移除 3/4/5 选择器 |
| 色相展示 | HSL（对齐 Figma），非 OKLCH.h |
| 主色 blob | 精确 anchorOklch，不跑 hueK 公式 |
| 布局 | 左栏 BlobLayoutEditor 拖拽；手机预览无手柄 |
| 渐变方向 | 左上亮、右下暗；enforceContrast 不压亮 blob |
| 整体明度 | 独立 slider，作用于 base/text/全部 blob |
| 动画 | Plan A 纯 CSS；Plan B WebGL 未做 |
| 主色/上中面积 | 125%（其余 150%） |
| 右上 hueK | −0.95（负偏加大） |
| Inspector 图片主色 | 展示提取色，非 store.hex |

---

## 10. 已知限制 & 勿踩坑

1. **`hex` 与图片模式脱节** — 展示/导出 seed 色时用 `palette[0]` 或 `anchorOklch`，不要用 `hex`。
2. **Fly 仅为 Web 近似** — 与 Native 可能有 ΔE 差异；对齐需加 parity 测试。
3. **无持久化** — 刷新丢状态；无用户系统。
4. **Light + Mock** — Feed Mock 主要服务 Dark HEX 预览。
5. **PNG 依赖 DOM** — headless/隐藏 tab 可能截不到；靠 Canvas fallback。
6. **dev server** — 须 `npm run dev`；PATH 需 node（nvm）。
7. **改 BLOB_PROFILES** — 同步更新本文 §5.3；考虑黄绿补偿是否仍合理。
8. **改 gradCss/blur** — 同步 `blobGradient.ts`、`PhonePreview`、`generators.ts`、`renderBackgroundImage.ts`。

---

## 11. 后续迭代 backlog（未实现）

- [ ] Fly 全量 / Native parity 测试与文档
- [ ] 项目保存、URL 分享、历史记录
- [ ] WebGL / shader 流体背景（Plan B）
- [ ] Figma 插件 / Code Connect
- [ ] Light 模式 Mock + 对比度策略完善
- [ ] 光斑数量可配置（若产品重新需要）
- [ ] `PRODUCT.md` / 设计系统 formalize（impeccable init 未完成）

---

## 12. 改 X 时看哪里

| 想改… | 主要文件 |
|--------|----------|
| 光斑颜色逻辑 / profile | `color/aurora.ts` |
| 光斑大小 / 默认位置 | `aurora.ts` BLOB_PROFILES · `blobLayout.ts` |
| 渐变边缘 / blur | `blobGradient.ts` · `aurora-keyframes.css` |
| 取色 / 合并容差 | `flyExtract*.ts` · `quantize.ts` · `InspectorPanel` |
| HEX / HSL 解析 | `seedColor.ts` |
| 深浅色预设 | `presets/lightness.ts` |
| 默认值 / 加载图片 | `store/useStudio.ts` |
| 导出格式 | `export/generators.ts` |
| 预览 UI | `components/PhonePreview.tsx` 等 |
| 动效路径 | `styles/aurora-keyframes.css` |

---

## 13. 术语

| 词 | 含义 |
|----|------|
| seed / 主色 | 输入 HEX 或 Fly 提取的代表色 |
| anchorOklch | 主色光斑锁定的 OKLCH |
| seedH / seedC | HSL 色相 + OKLCH 纯度（推导副色用） |
| blob / 光斑 | radial-gradient + blur 的一层 |
| richness | 丰富度，副色色相/纯度 spread |
| lT | profile 内明度档位 0–1 |
| softEdge | 主色多段渐变，边缘更融 |
| gradCss | 预生成的 radial-gradient 字符串 |

---

## 14. 文档维护约定

**何时更新本文：**

- 修改 `BLOB_PROFILES`、默认值、取色管线、导出格式
- 完成一轮产品决策（写入 §9）
- 新增已知 bug / 限制（§10）
- 勾选或新增 backlog（§11）

**不必写进本文：** 一次性调试笔记、已 revert 的方案。

**对外介绍 / PRD：** 可从 §0–§1、§5 摘要改写；技术细节以本文为准。

---

*迭代时优先读 §0、§5、§9、§10、§12。*
