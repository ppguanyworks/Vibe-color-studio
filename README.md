# Vibe Color Studio

移动端背景色工具（纯前端）。**色值 HEX** 生成 5 光斑动态渐变；**图片取色** 按 OKLCH V2.3 提取适合白字的纯色底。两套模式状态隔离。

## 功能

- **色值 HEX**（默认）：5 光斑 Aurora、Dark / Light、光斑布局、对比度、导出 CSS / 静态 / JSON / PNG
- **图片取色**：OKLCH V2.3 提取纯色；预览为纯色底 + 居中叠图、标题、Ratio、底部 HEX 胶囊；标题用文件名，无意义则 Lorem Ipsum；当前帧 PNG；相对白字对比度
- **中 / 英** 顶栏切换（记住选择）

## 快速开始

```bash
cd vibe-color-studio
npm install
npm run dev
```

浏览器打开 [http://localhost:5173/](http://localhost:5173/)（勿用 `127.0.0.1`，本机 Vite 可能只监听 IPv6 / localhost）。

在线预览（GitHub Pages）：https://ppguanyworks.github.io/Vibe-color-studio/

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（须保持终端运行） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint |

## 界面结构（当前）

```
┌ Header（品牌 + HEX 快捷键 + 中/EN）─────────────────────┐
│  预览舞台（手机框）              │ 右侧控制栏 320px     │
│  HEX：渐变 + Feed Mock           │  HEX：输入 / 渐变    │
│  图片：纯色底 + 圆角叠图         │  图片：上传 + 结果   │
│  · 底部悬浮工具栏                │  HEX：光斑布局（折叠）│
│    HEX：明度 · 帧 · 导出 · 对比度│  HEX：底部「导出代码」│
│    图片：帧 · 白字对比度 · 眼睛  │                      │
└──────────────────────────────────┴─────────────────────┘
导出弹窗仅 HEX（CSS / 静态 / JSON）
```

## 技术栈

Vite 8 · React 19 · TypeScript · Tailwind 4 · zustand · culori · html-to-image  
UI 字体：Urbanist · 手机 Mock 字体：TikTok Sans（本机 `public/fonts/`，不进仓库；缺字时回退系统无衬线）

## 文档

| 文档 | 用途 |
|------|------|
| [docs/PROJECT_REFERENCE.md](docs/PROJECT_REFERENCE.md) | **工程上下文** — 开新对话时 `@` 此文件 |
| [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) | **设计规范** — 色、字、圆角 smoothing、组件规则 |
| 本文 README | 对外简介与运行说明 |

## 仓库

GitHub：https://github.com/ppguanyworks/Vibe-color-studio  
在线站点：https://ppguanyworks.github.io/Vibe-color-studio/
