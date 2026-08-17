# Vibe Color Studio · 项目上下文文档

> **用途：** 后续迭代、修 bug、调参、接需求时的**单一事实源**。  
> 给人和 AI 读：开新对话时 `@docs/PROJECT_REFERENCE.md` 即可恢复项目上下文。  
> **路径：** `vibe-color-studio/` · **最后同步：** 2026-08-17（HEX / 图片状态隔离 + 图片叠图布局）  
> **约定：** 改布局 / 组件 / 默认值 / 色彩规则 / 导出后，**同步更新本文 + README**（见仓库 `.cursor/rules/sync-project-docs.mdc`）。视觉 token 见 [DESIGN_SPEC.md](./DESIGN_SPEC.md)。

---

## 0. 30 秒读懂

| 项 | 内容 |
|----|------|
| **是什么** | 移动端 Aurora 动态渐变背景生成器（纯前端） |
| **输入** | **两套互不互通的模式：** HEX 动态渐变 · 图片 OKLCH V2.3 纯色 |
| **输出** | HEX：5 光斑渐变 + CSS/JSON/PNG；图片：纯色底 + PNG |
| **核心函数** | HEX：`generateAurora()`；图片：`extractPosterColor()` |
| **参数真源** | HEX：`src/color/aurora.ts` → `BLOB_PROFILES`；图片：`src/color/posterExtract.ts` → `POSTER_EXTRACT` |
| **默认模式** | `inputMode: 'hex'`，`lightnessId: 'dark'`，`showOverlay: true`，`locale: 'zh'` |
| **UI 风格** | Framer 式近黑极简 · Urbanist（chrome）· TikTok Sans（手机 Mock） |

---

## 1. 为什么要做

**场景：** TikTok / 音乐 Feed、活动页等需要以品牌主色为锚点的大面积**动态渐变底**，并与 Tab 栏、内容区形成明暗层次。

**痛点：** Figma 手工铺渐变 → 开发 CSS 复刻易漂移；封面图取色与客户端 Fly 不一致；黄绿等高感知色在 screen 混合下过亮；主色光斑边缘易生硬。

**本工具：** HEX 输入参数化 5 光斑动态渐变；图片上传按 OKLCH V2.3 提取适合白字的纯色底。两套模式状态隔离。

---

## 2. 界面与数据流

```
用户操作
  · InspectorRail（HEX：输入/渐变/光斑；图片：上传 + V2.3 结果）
  · BottomToolbar（HEX：明度·帧·导出·对比度；图片：帧·白字对比度）
        ↓
useStudio — hex 状态与 image 状态隔离
        ↓
HEX：generateAurora → PhonePreview 光斑
图片：extractPosterColor → PhonePreview 纯色底 + 圆角叠图
```

**布局（2026-07 重设计后）：**

| 区域 | 组件 | 职责 |
|------|------|------|
| 顶栏 | `AppHeader` | 品牌词 + HEX 快捷键提示 + **中/英开关** |
| 中 | `PreviewStage` + `PhonePreview` | HEX：渐变 + Feed Mock；图片：纯色底（未上传 `#2A2A2A`）+ 叠图（半屏宽方槽居中、槽顶约 68px、圆角 10、无阴影）+ 标题 + Ratio + 底部 HEX 胶囊 |
| 底悬浮 | `BottomToolbar` | HEX：明度/导出/对比度；图片：当前帧 + 白字对比度 + 眼睛 |
| 右 320px | `InspectorRail` | HEX：色值+折叠色相 / 渐变 / 光斑 / 导出；图片：仅上传与提取结果 |
| 弹层 | `ExportModal` | **仅 HEX**：CSS / 静态 / JSON |

**快捷键（仅 HEX）：** `⌘/Ctrl+E` 打开导出；`←` `→` 切换 Light/Dark（输入框内不触发）；`Esc` 关弹窗。

**渲染链：** HEX 模式由 `App.tsx` 把 store 接到 `generateAurora`；图片模式用 `posterColor.color` 作纯色底。改 HEX 默认值看 `useStudio.ts`，改生成逻辑看 `aurora.ts`，改图片取色看 `posterExtract.ts`。

**已删除（勿再引用）：** `ExportDrawer`、`LightnessTabs`、`PreviewStatusBar`。

---

## 3. 技术栈与目录

```
vibe-color-studio/
├── public/fonts/TikTokSans-VF.ttf   # 仅手机 Mock 使用
├── src/
│   ├── App.tsx                      # header + stage + rail + modal / 快捷键
│   ├── index.css                    # 设计 token、Urbanist、.phone-mock / .glass
│   ├── i18n.ts                      # chrome 中/英字典
│   ├── store/useStudio.ts
│   ├── color/                       # aurora · seed · posterExtract · imageTitle · blob* · oklch
│   │                                # flyExtract / quantize 仍在仓库，图片 Tab 不再调用
│   ├── components/
│   │   ├── AppHeader · BottomToolbar · ContrastChip
│   │   ├── InspectorRail · InspectorPanel · BlobLayoutEditor
│   │   ├── PreviewStage · PhonePreview · MusicFeedMock
│   │   ├── ExportModal · ui · icons
│   ├── export/generators.ts · renderBackgroundImage.ts
│   ├── presets/lightness.ts
│   ├── tokens/tux-preview.ts        # Feed Mock 尺寸 / 色 token
│   └── styles/aurora-keyframes.css
├── docs/PROJECT_REFERENCE.md
└── README.md
```

**依赖：** Vite 8 · React 19 · Tailwind 4 · culori · zustand · html-to-image · `@fontsource-variable/urbanist`

**运行：**

```bash
cd vibe-color-studio && npm install && npm run dev
# http://localhost:5173 （勿用 127.0.0.1；会话空闲后进程可能退出，需重新 npm run dev）
# 在线：https://ppguanyworks.github.io/Vibe-color-studio/
```

---

## 4. 状态默认值（useStudio）

HEX 与图片是两套独立字段，`inputMode` 只切 UI，**互不写回**。

| 字段 | 默认 | 说明 |
|------|------|------|
| `locale` | `'zh'` | 顶栏中/英；`localStorage` 键 `vibe-locale` |
| `inputMode` | `'hex'` | 分段控件：色值 HEX → 图片取色；切换不清除另一套状态 |
| `hex` | `#4A6CF7` | **仅 HEX 模式**；图片模式不用此值 |
| `richness` | `0.4` | 丰富度（HEX） |
| `speed` | `1` | 1.0× ≈ 旧版 0.8×（`SPEED_BASE=0.8`） |
| `luminance` | `0` | 整体明度 ±1 → OKLCH L ±0.38 |
| `lightnessId` | `'dark'` | 仅 HEX 底栏切换 |
| `blobAnchors` | 见 `blobLayout.ts` | 5 点：TL/TR/BL/BR/上中 |
| `showOverlay` | `true` | HEX：Feed Mock；图片：叠图 + 标题；工具栏眼睛切换 |
| `imageTitle` | `null` | 有意义的文件名，否则 `Lorem Ipsum` |
| `posterColor` | `null` | 图片 V2.3 结果；`loadImage` 只写这一套 |

**图片取色写回：** `loadImage` → `extractPosterColor()` → `posterColor`。**不更新** `hex` / `seedH` / `anchorOklch` / 光斑参数。

**Inspector 图片主色：** 用 `posterColor.color` / `posterColor.oklch`，不能用 store 里的 `hex`。

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
- `enforceContrast` **只压 base 底色**，不压亮 blob
- UI（HEX）：`ContrastChip` 默认 `4.5:1`（一位小数）+ 等级徽章；hover 显示完整 WCAG / APCA / 文字色
- UI（图片）：`WhiteContrastChip` 显示相对白字对比度（V2.3 目标 ≥ 9:1）

---

## 6. 图片取色（OKLCH V2.3）

**入口：** `src/color/posterExtract.ts` → `extractPosterColor()`

透明像素先合成到 **白底**，再网格采样。EXIF 朝向：`createImageBitmap(file, { imageOrientation: 'from-image' })`。

| 参数 | 值 |
|------|-----|
| 目标采样 | ~2400 点二维网格（格心取样） |
| 候选 L | 0.20–0.65 |
| 最大 C | 0.15 |
| 色相桶 | 12（~30°）；C < 0.03 走中性桶 |
| 代表色 | 桶内 L/C 中位数 + 色相圆周均值 |
| 色域映射 | 超出 sRGB 时二分降 C，24 次 |
| 白字对比度 | ≥ 9:1；不够则二分降 L |
| 无候选 | `#000000` |

**预览：** 纯色底 `posterColor.color`，未上传时 `#2A2A2A`。上传图放在半屏宽正方形槽内居中（不同比例共用中心点），槽顶约 68px，圆角 10、无阴影。标题距槽约 16px（TikTok Sans）；其下 `Ratio: W:H` 与底部 HEX 胶囊均为 Urbanist 11px、40% 白。底部始终有 HEX 胶囊（0.5px 描边 20% 白 + 4% 白 fill）。无意义文件名则 `Lorem Ipsum`。右栏缩略图 8px 圆角 + 60% smoothing、高度封顶。

**图片模式不提供：** 渐变滑块、光斑布局、明暗切换、导出 CSS/JSON、「合并相似色」。

**旧 Fly 管线**（`quantize.ts` / `flyExtract.ts`）仍在仓库，**图片 Tab 不再调用**。

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
| JSON | params + blobs | HEX only；不再附 Fly extraction |
| PNG | HEX：`html-to-image` 截 `[data-aurora-export-root]`；图片：同节点纯色底，失败回退 Canvas 填色 | revoke blob URL 延后约 10s |

入口：HEX 工具栏「导出代码」/ 右栏底部按钮 → `ExportModal`；两模式工具栏「当前帧」→ HEX `downloadBackgroundPng` / 图片 `downloadSolidBackgroundPng`。

改预览样式时，**同步检查** CSS 导出与 PNG 路径。

---

## 9. 已做迭代决策（避免重复讨论）

| 决策 | 结论 |
|------|------|
| 光斑数量 | 固定 5，移除 3/4/5 选择器 |
| 色相展示 | HSL（对齐 Figma），非 OKLCH.h |
| HEX 色相滑杆 | 放在色值框下，默认折叠；拖动同步 HEX 与色块 |
| 主色 blob | 精确 anchorOklch，不跑 hueK 公式 |
| 布局（旧） | 左栏 BlobLayoutEditor；手机预览无手柄 |
| 布局（2026-07） | Framer 风：右栏控制 + 底悬浮工具栏 + 导出弹窗；光斑布局默认折叠 |
| 渐变方向 | 左上亮、右下暗；enforceContrast 不压亮 blob |
| 整体明度 | 独立 slider，作用于 base/text/全部 blob |
| 动画 | Plan A 纯 CSS；Plan B WebGL 未做 |
| 主色/上中面积 | 125%（其余 150%） |
| 右上 hueK | −0.95（负偏加大） |
| Inspector 图片主色 | 展示 `posterColor`，非 store.hex |
| HEX / 图片状态 | **隔离**：切 Tab 互不覆盖 |
| 图片预览 | 纯色底（默认 `#2A2A2A`）+ 叠图（半屏宽方槽居中、槽顶约 68px、圆角 10、无阴影）+ 文件名或 Lorem Ipsum + Ratio + 底部 HEX 胶囊 |
| 图片对比度 | 简化 `WhiteContrastChip`：相对白字 |
| chrome 语言 | 顶栏 `中文 | EN`，默认中文，`vibe-locale` |
| 对比度条 | 精简为 `ContrastChip`：一位小数 + 徽章 + 文字方向；细节进 hover |
| chrome 字体 | Urbanist Variable |
| 手机 Mock 字体 | TikTok Sans VF（本机 `public/fonts/`，不进 Git；缺字回退系统字体） |
| Tailwind v4 | `scale-*` 是独立 `scale` 属性，transition 勿只写 `transform` |
| 托管 | GitHub Pages + Actions；仓库需 Public（免费账号私有仓不能开 Pages） |

---

## 10. 已知限制 & 勿踩坑

1. **两套状态隔离** — 图片结果在 `posterColor`；HEX 渐变用 `hex` / `anchorOklch`。不要把提取色写回 HEX 字段。
2. **图片不是 Aurora** — 不要在图片模式画 blob、开导出弹窗或明暗切换。
3. **locale 是唯一持久化** — 其余刷新丢失；无用户系统。
4. **Light + Mock** — Feed Mock 主要服务 Dark HEX 预览；图片模式眼睛按钮切换叠图。
5. **PNG 依赖 DOM** — headless/隐藏 tab 可能截不到；靠 Canvas fallback。
6. **dev server** — 须 `npm run dev` 且保持进程；Cursor 会话空闲 / 休眠后常会停掉。分享给别人用 GitHub Pages：https://ppguanyworks.github.io/Vibe-color-studio/
7. **改 BLOB_PROFILES** — 同步更新本文 §5.3。
8. **改 gradCss/blur** — 同步 `blobGradient.ts`、`PhonePreview`、`generators.ts`、`renderBackgroundImage.ts`。
9. **窄屏** — 右栏固定 320px；&lt; ~640px 舞台会挤；工具栏在 `lg` 以下图标化。
10. **勿引用已删组件** — `ExportDrawer` / `LightnessTabs` / `PreviewStatusBar`。
11. **Fly 文件未删除** — `flyExtract*.ts` / `quantize.ts` 是遗留，图片 Tab 不要重新接上。
12. **叠图标题** — 只用文件名；`image.png` / `IMG_1234` 等无意义名显示 `Lorem Ipsum`。不做 OCR。

---

## 11. 后续迭代 backlog（未实现）

- [ ] 项目保存、URL 分享、历史记录
- [ ] WebGL / shader 流体背景（Plan B）
- [ ] Figma 插件 / Code Connect
- [ ] Light 模式 Mock + 对比度策略完善
- [ ] 光斑数量可配置（若产品重新需要）
- [ ] 窄屏右栏折叠 / 抽屉（产品待定）
- [x] HEX / 图片双模式隔离 + OKLCH V2.3 纯色取色
- [x] 部署静态站（GitHub Pages）：`.github/workflows/deploy-pages.yml`，`vite.config.ts` 在 CI 设 `base: /Vibe-color-studio/`

---

## 12. 改 X 时看哪里

| 想改… | 主要文件 |
|--------|----------|
| 光斑颜色逻辑 / profile | `color/aurora.ts` |
| 光斑大小 / 默认位置 | `aurora.ts` BLOB_PROFILES · `blobLayout.ts` |
| 渐变边缘 / blur | `blobGradient.ts` · `aurora-keyframes.css` |
| 取色（图片） | `color/posterExtract.ts` |
| 叠图标题 | `color/imageTitle.ts` · `PhonePreview` |
| HEX / HSL 解析 | `seedColor.ts` |
| 深浅色预设 | `presets/lightness.ts` |
| 默认值 / 加载图片 / overlay / 语言 | `store/useStudio.ts` · `i18n.ts` |
| 导出格式 / 弹窗 | `export/generators.ts` · `ExportModal` |
| PNG 下载 | `export/renderBackgroundImage.ts`（HEX / 纯色两条路径） |
| 顶栏 / 工具栏 / 右栏 | `AppHeader` · `BottomToolbar` · `InspectorRail` |
| 手机 Mock UI / 字体 | `MusicFeedMock` · `tokens/tux-preview` · `index.css` `.phone-mock` |
| 设计 token / chrome 字体 / 圆角 smoothing | `index.css` · `docs/DESIGN_SPEC.md` |
| 动效路径 | `styles/aurora-keyframes.css` |
| 整体壳子 | `App.tsx` |
| GitHub Pages | `.github/workflows/deploy-pages.yml` · `vite.config.ts` `base` |

---

## 13. 术语

| 词 | 含义 |
|----|------|
| seed / 主色 | HEX 输入色；图片模式则是 V2.3 `posterColor` |
| posterColor | 图片提取的纯色结果（HEX + OKLCH + 白字对比度） |
| anchorOklch | HEX 主色光斑锁定的 OKLCH |
| seedH / seedC | HSL 色相 + OKLCH 纯度（推导副色用） |
| blob / 光斑 | radial-gradient + blur 的一层 |
| richness | 丰富度，副色色相/纯度 spread |
| lT | profile 内明度档位 0–1 |
| softEdge | 主色多段渐变，边缘更融 |
| gradCss | 预生成的 radial-gradient 字符串 |
| showOverlay | 手机框内 Feed/图片叠层开关 |

---

## 14. 文档维护约定

**何时更新本文 + README：**

- 修改布局、增删组件、默认值、取色管线、导出格式、字体策略
- 修改 `BLOB_PROFILES` 或对比度/导出 UX
- 完成一轮产品决策（写入 §9）
- 新增已知 bug / 限制（§10）或 backlog（§11）

**不必写进本文：** 一次性调试笔记、已 revert 的方案。

**开新对话：** `@docs/PROJECT_REFERENCE.md`（必要时再 `@README.md`）。

---

*迭代时优先读 §0、§2、§5、§9、§10、§12。*
