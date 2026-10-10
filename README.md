# 樱花时节 · 视觉小说（纯前端静态版）

一个关于告别、约定与遗憾的日式视觉小说。**完全静态、零后端**：没有服务器、没有数据库、没有登录，
所有存档与进度都保存在玩家浏览器的本地数据库（IndexedDB）里，并提供一键导出 / 导入 JSON 备份。

- 仓库地址：<https://github.com/MrWoods1692/galagame>
- 许可证：AGPL-3.0

## 特性

- **纯前端纯静态**：构建产物是 `dist/` 下的普通静态文件，运行时不发起任何外部请求。
- **本地数据库存档**：6 个存档槽位、结局收集、事件回想、CG 画廊、设置全部写入 IndexedDB（库名 `galagame`）。
- **数据可导出**：设置面板内可将全部本地数据导出为 JSON 备份，或从备份导入恢复。
- **资源全部随源码提供**：场景背景、角色立绘、107 段角色语音（`public/audio/voices/`）均为仓库内静态资源。
- **BGM 本地实时合成**：使用 Tone.js 程序化合成四首曲风（日常 / 悲伤 / 宁静 / 希望），不依赖任何音频文件。
- **移动端适配**：自动横屏容器、竖屏单手模式、触屏点击推进。
- **剧本易改**：剧情写在 `src/game/script.ts` 的 DSL 文本里，分支、标记与结局一目了然。

## 快速开始

```bash
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 类型检查 + 构建，产物在 dist/
npm run preview  # 本地预览构建产物
npm run lint     # oxlint 静态检查
```

## 部署

`npm run build` 生成的 `dist/` 可直接托管在任意静态平台：

- **GitHub Pages**：把 `dist/` 内容推到 `gh-pages` 分支（或在仓库 Settings → Pages 选择发布目录）。
  `vite.config.ts` 中 `base: './'` 使用相对路径，因此部署在 `https://<user>.github.io/galagame/` 这类子路径也能正常加载。
- **Netlify / Vercel / Cloudflare Pages**：构建命令 `npm run build`，发布目录 `dist`。
- **任意静态服务器**：直接 `python3 -m http.server -d dist` 之类即可。

## 数据存储说明

| 项目 | 说明 |
| --- | --- |
| 存储位置 | 浏览器 IndexedDB，数据库名 `galagame`，对象仓库 `kv` |
| 键名 | `sakura_vn_slot_0` … `sakura_vn_slot_5`（存档槽位）、`sakura_vn_meta`（收集进度与设置） |
| 降级 | 浏览器禁用 IndexedDB 时自动降级到 `localStorage`，均不可用时退化为内存存储（当次会话有效） |
| 旧版本迁移 | 启动时会自动把早期版本遗留在 `localStorage` 中的存档迁移进 IndexedDB |
| 备份文件 | 设置 → 存档数据 → 导出，生成 `galagame-save-<时间戳>.json`（含 `meta` 与各槽位信封） |

> 数据只存在于本机浏览器，清除浏览器数据或更换浏览器/设备会丢失进度，请善用导出备份。

## 目录结构

```txt
├── index.html                 # 入口 HTML
├── public
│   ├── favicon.svg            # 站点图标
│   └── audio/voices/          # 角色语音静态 MP3（107 段）
├── src
│   ├── main.tsx               # 入口：先载入本地数据库，再渲染应用
│   ├── App.tsx                # 标题 / 游戏 / 收集 的流程编排与自适应画幅
│   ├── db/localDb.ts          # IndexedDB 访问层（含 localStorage / 内存降级）
│   ├── game
│   │   ├── store.ts           # 存档、收集进度、设置的持久化与导出 / 导入
│   │   ├── script.ts          # 剧本文本 DSL（say / bg / show / hide / bgm / mark / ending）
│   │   ├── assets.ts          # 背景与立绘静态导入入口
│   │   ├── screens/           # 标题、剧情游玩、收集殿堂
│   │   ├── components/        # 对话框、控制栏、存档面板、设置、开源仓库弹窗等
│   │   ├── audio/             # BGM 合成引擎与本地语音播放器（含语音清单）
│   │   └── data/              # 结局、回想事件、CG 数据
│   └── index.css              # 全局样式与动画
├── package.json
├── vite.config.ts             # base: './'，可直接部署到子路径
└── tsconfig*.json
```

## 二次创作

- **改剧情**：编辑 `src/game/script.ts`。自定义命令为 `say / bg / show / hide / bgm / mark / ending`，
  `mark` 是存档检查点，`ending <id>` 触发结局并写入收集进度。
- **改美术**：替换 `src/assets/bg/`、`src/assets/portraits/` 下的 PNG，并在 `src/game/assets.ts` 中注册。
- **改语音**：把 MP3 放进 `public/audio/voices/`，并在 `src/game/audio/voiceManifest.json` 里登记
  （`by_text` 精确匹配「说话人_台词」，`by_label` 可按剧本 label 匹配）。
- **改结局 / 回想 / CG**：`src/game/data/` 下的 `endings.ts`、`recallEvents.ts`、`cgs.ts`。

## 许可证

AGPL-3.0，详见 [LICENSE](./LICENSE)。
