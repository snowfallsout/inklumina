# Colorfield

Colorfield 是一個現場互動用的 MBTI 粒子展示系統。前端以 SvelteKit 建構，`/display` 與 `/mobile` 分別負責大屏展示與手機加入；後端由 `server/` 提供 Express + Socket.IO 服務與場次 API。

## 最新進度 / Current status

- `src/routes/(app)/display` 已完成為 client-only 的展示頁，包含粒子畫布、相機切換、臉/手偵測、Legend、Footer、Session 面板與 join QR。
- `src/routes/(app)/mobile` 已完成為手機加入流程，包含 welcome、MBTI 選擇、提交與結果卡。
- 即時互動現在走 Socket.IO，不是 SSE。手機送出 `submit_mbti`，display 端接收 `state`、`spawn_particles`、`session_reset`、`lucky_color`。
- 場次資料透過 `/api/sessions` 系列 API 管理，並持久化到 `sessions.json`。
- 根路由 `/` 是一個靜態入口頁，提供 `/display` 和 `/mobile` 的連結。

## 目前架構 / Architecture

- Frontend: SvelteKit + Vite。
- Backend: Express + Socket.IO in `server/`。
- Dev proxy: `vite.config.ts` proxies `/api` and `/socket.io` to `http://localhost:3000`。
- Shared runtime state and contracts live under `src/lib/display/` and `src/lib/shared/`。

## 主要路由 / Main routes

- `/`
  入口頁，提供展示端與手機端連結。

- `/display`
  大螢幕展示頁。會載入粒子畫布、標頭、圖例、HUD、Footer 與場次管理器，並支援相機、臉部與手部追蹤、QR join、場次切換。

- `/mobile`
  手機加入頁。使用者先看 welcome 畫面，再選擇 MBTI，最後取得結果卡。

## 即時流程 / Realtime flow

1. 手機端在 `mobile` 頁面建立 Socket.IO 連線。
2. 使用者選擇 MBTI 後送出 `submit_mbti`。
3. `server/socket.js` 驗證 MBTI、更新 active session、寫入 `sessions.json`。
4. 伺服器回傳 `lucky_color` 給送出者，並廣播 `spawn_particles` 給所有連線中的展示端。
5. 展示端更新 legend、總人數與粒子畫面；建立新場次時會收到 `session_reset`。

## 資料模型 / Data model

`sessions.json` 會保存：

- `active`: 目前場次
- `history`: 歷史場次
- `counts` 與 `total`: 每個場次的 MBTI 計數與總人數
- `participants` 與 `lastParticipantAt`: 新版 session record 可能包含的額外資訊
- `meta`: 版本與更新時間等資訊

穩定使用的欄位仍是 `id`、`name`、`createdAt`、`counts`、`total` 與 `history`。

## Scripts / 指令

- `npm run dev`
  啟動 SvelteKit dev server，預設 `http://localhost:5173`。

- `npm run dev:socket`
  啟動 Socket/API 伺服器，預設 `http://localhost:3000`。

- `npm run smoke`
  執行 API 與 Socket.IO smoke test。

- `npm run build`
  建置 SvelteKit 專案。

- `npm run preview`
  預覽建置後的前端。

- `npm run check`
  執行 `svelte-check`。

- `npm run check:watch`
  執行 `svelte-check --watch`。

## 本機開發 / Local development

1. `npm install`
2. `npm run dev:socket`
3. `npm run dev`
4. 開啟 `http://localhost:5173/display`
5. 開啟 `http://localhost:5173/mobile`

如果你用 Bun，也可以把前兩個指令改成 `bun run dev:socket` 和 `bun run dev`。

## 重要檔案 / Important files

- `src/routes/(app)/display/+page.svelte`
  顯示頁入口。

- `src/routes/(app)/display/components/DisplaySessionManager.svelte`
  場次管理與 join QR。

- `src/lib/display/state.ts`
  顯示頁狀態與 session UI 狀態。

- `src/lib/display/session/client.ts`
  場次查詢、建立、刪除與 QR 生成。

- `src/lib/shared/contracts.ts`
  Socket 與 session 的共用資料結構。

- `src/lib/shared/socket-client.ts`
  Socket.IO client factory。

- `src/routes/(app)/mobile/+page.svelte`
  手機頁入口。

- `src/routes/(app)/mobile/mobile.realtime.ts`
  手機端 Socket.IO 連線與 MBTI 提交。

- `server/index.js`
  Socket/API 伺服器啟動入口。

- `server/app.js`
  Express API 與靜態資源設定。

- `server/socket.js`
  Socket.IO 事件處理。

- `server/sessions.js`
  場次持久化。

- `sessions.json`
  實際儲存的場次資料。

- `vite.config.ts`
  `/api` 與 `/socket.io` 代理設定。

## 專案目錄 (map tree)

下方為專案目錄摘要（僅列出常用路徑與重點檔案）：

```
.
├─ DISPLAY_OPERATION_ACCEPTANCE.md
├─ README.md
├─ package.json
├─ svelte.config.js
├─ tsconfig.json
├─ vite.config.ts
├─ sessions.json
├─ scripts/
│  └─ smoke-test.js
├─ server/
│  ├─ index.js
│  ├─ app.js
│  ├─ socket.js
│  ├─ sessions.js
│  └─ mbti.js
├─ src/
│  ├─ app.css
│  ├─ lib/
│  │  ├─ display/
│  │  │  ├─ constants.ts
│  │  │  ├─ session.ts
│  │  │  ├─ state.ts
│  │  │  └─ runtime/
│  │  │     └─ (camera, draw, realtime, socket, ...)
│  │  └─ shared/
│  │     └─ (contracts.ts, socket-client.ts)
│  └─ routes/
│     └─ (app)/
│        ├─ display/
│        │  ├─ +page.svelte
│        │  └─ components/
│        └─ mobile/
│           ├─ +page.svelte
│           └─ mobile.realtime.ts
└─ static/
  └─ (display and mobile helper scripts)
```

## 備註 / Notes

- 這份 README 已對齊目前的 route-driven SvelteKit + Socket.IO 架構。
- 舊的 `/api/submit`、`/api/events` 與 `npm start` 說明已不再使用。
- 正式部署仍需要同時考慮前端與 Socket/API 兩個進程，沒有單一 `npm start` script。