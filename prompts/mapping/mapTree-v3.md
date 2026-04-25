# MAP Tree v3 — 合併版（包含 mapping.md 內容）

此檔為合併結果，將原 `mapTree-v3.md` 與 `mapping.md` 的重要內容整合為單一參考檔案，並在每個主要目錄下加入一行簡短說明。原始檔 `mapping.md` 保留不變以便備份與比對。

## 快覽

- 專案類型：SvelteKit + TypeScript + Vite
- 主要程式碼位置：`src/`
- 前端 UI 元件集中在：`src/lib/components/`

## 重要補充（v3 變更重點）

- 新增：`src/lib/config/settings.ts` — 中央化的視覺與物理參數範本（含顏色、物理、Mediapipe 與 socket 設定）。
- 型別拆分：型別已移至 `src/lib/types/index.d.ts`，方便其他模組直接從 `src/lib/types` 引用。
- Canvas 角色：canonical 的 `Stage.svelte` 對應到 repo 的 `src/lib/components/display/Canvas.svelte`。

## 檔案樹（重要節點，附一行說明）

```
AGENTS.md             # 專案 agent 指南與工作流程
package.json          # 專案相依與腳本
README.md             # 專案總覽與快速啟動
svelte.config.js      # SvelteKit / Vite 設定
tsconfig.json         # TypeScript 設定
vite.config.ts        # Vite 設定
mapTree-v3.md         # 本檔案（合併版）
Gemini-Map-Tree-v2.md # 舊版或參考對照檔

src/                  # 源碼主目錄（應用程式邏輯與 UI）
  app.d.ts            # 全域類型宣告
  app.html            # HTML 模板
  hooks.server.ts     # SvelteKit server hooks
  lib/                # 函式庫、元件與共享模組
    index.ts          # lib 匯出入口
    assets/           # 靜態資產（圖像等）
    components/       # 可重用 UI 元件
      display/        # 桌面/展示相關組件（Canvas、Legend 等）
        Canvas.svelte
        Legend.svelte
        Header.svelte
        HandBadge.svelte
        Toast.svelte
      mobile/         # 行動裝置專用元件
    core/             # 核心演算法與引擎（粒子、互動）
      interactionGrid.ts
      particleEngine.ts
      spriteCache.ts
    services/         # 外部整合（mediapipe、socket）
      mediapipe.ts
      socket.ts
    stores/           # Svelte stores（狀態管理）
      media.ts
      mbti.ts
      particles.ts
      session.ts
      ui.ts
    config/           # 中央化設定與常數
      settings.ts     # 建議作為 single-source-of-truth
    types/            # TypeScript 型別定義
      index.d.ts
    styles/           # 共用樣式與 tokens
    utils/            # 工具函式

  routes/             # 頁面路由
    +layout.svelte     # 全域 layout
    +page.svelte       # 根頁面
    display/           # 展示頁面路由與 server handler
      +page.svelte
      +server.ts

static/               # 靜態 HTML 入口或備援頁面
  display.html         # 傳統展示入口（備援）
  entryMotion.html
  mobile.html
```

## 維護建議

- 保留 `settings.ts` 作為 single-source-of-truth，後續把主要常數從 `core/` 或 `stores/` 移入此檔以減少散落的參數。
- 如需命名一致性，可在團隊約定中記錄 `Stage <-> Canvas` 映射，或考慮將 `Canvas.svelte` 改名為 `Stage.svelte`（此為破壞性改動，需確認）。

---

若要我執行下一步（例如把舊版檔案移到 `prompts/mapping/archived/`、或把本檔加入 `AGENTS.md` 的索引），請告訴我想要的處理方式。
