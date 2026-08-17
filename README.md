# Vibe Color Studio

移动端 **Aurora 动态渐变背景**生成器（纯前端）。输入品牌主色或上传图片取色，实时预览 5 光斑动态渐变，导出 CSS / JSON / PNG。

## 功能

- **色值 HEX**（默认）或 **图片取色**（Fly 子集管线）
- **Dark / Light** 明度预览切换
- **对比度校验**（WCAG + APCA，展示最差值）
- **光斑布局**拖拽编辑（右侧栏，默认折叠）
- **导出**：CSS（含动画）· 静态 CSS · JSON token · 当前帧 PNG

## 快速开始

```bash
cd vibe-color-studio
npm install
npm run dev
```

浏览器打开 [http://localhost:5173/](http://localhost:5173/)（勿用 `127.0.0.1`，本机 Vite 可能只监听 IPv6 / localhost）。

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（须保持终端运行） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint |

## 界面结构（当前）

```
┌ Header（品牌 + 快捷键提示）────────────────────────────┐
│  预览舞台（手机框）              │ 右侧控制栏 320px     │
│  · 渐变 + Feed Mock / 图预览     │  · 输入 / 渐变参数   │
│  · 底部悬浮工具栏                │  · 光斑布局（折叠）  │
│    明度 · 当前帧 · 导出 · 对比度 │  · 底部「导出代码」  │
└──────────────────────────────────┴─────────────────────┘
导出 → 居中弹窗（CSS / 静态 / JSON）
```

## 技术栈

Vite 8 · React 19 · TypeScript · Tailwind 4 · zustand · culori · html-to-image  
UI 字体：Urbanist · 手机 Mock 字体：TikTok Sans（本机 `public/fonts/`，不进仓库；缺字时回退系统无衬线）

## 文档

| 文档 | 用途 |
|------|------|
| [docs/PROJECT_REFERENCE.md](docs/PROJECT_REFERENCE.md) | **上下文单一事实源** — 开新对话时 `@` 此文件恢复项目记忆 |
| 本文 README | 对外简介与运行说明 |

## 仓库

GitHub：https://github.com/ppguanyworks/Vibe-color-studio
