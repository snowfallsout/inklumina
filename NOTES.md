**Colorfield — Server Migration Notes**

**概述 / Summary**
- 中文：本次任務把原有 root `server/` 的伺服器邏輯作為參考，將伺服器功能改寫並整合到 `sv-app/server` 下（僅在本機、且不修改 root 檔案）。目標是讓 `sv-app` 能獨立以 ESM 形式啟動並提供 `/api` 與 Socket.IO 功能。
- EN: Migrated server logic into `sv-app/server` (local-only, root untouched). Goal: make `sv-app` run the server in ESM, providing REST API and Socket.IO.

**完成項目 / Completed**
- 將 `sv-app/server` 的五個主要檔案改寫為 ESM：`index.js, app.js, sessions.js, socket.js, mbti.js`。
- 修正 Windows ESM 路徑：使用 `fileURLToPath(import.meta.url)` + `path.dirname(...)` 取得 `__dirname`。
- 確保本地匯入使用明確副檔名（`./foo.js`），避免 Node ESM 的解析問題。
- `sv-app` 使用自己的 `sessions.json`（位於 `sv-app/sessions.json`），root `sessions.json` 保留為參考且未改動。
- 執行 smoke test：啟動 `sv-app/server`、GET `/api/sessions` 成功回應、手動觸發並驗證 Socket 行為（臨時啟動測試後關閉）。

**關鍵檔案位置 / Key files**
- sv-app/server/index.js — server bootstrap (http + socket.io)
- sv-app/server/app.js — express app + routes
- sv-app/server/sessions.js — sessions read/write (sv-app/sessions.json)
- sv-app/server/socket.js — socket handlers
- sv-app/server/mbti.js — MBTI constants
- sv-app/sessions.json — runtime session store used by sv-app
- server/ (root) — 原始參考實作（未修改）

**使用技術 / Technologies**
- Node.js (ESM) — `import` / `export`, `fileURLToPath`
- Express — REST API
- Socket.IO — realtime events (submit_mbti, spawn_particles, lucky_color)
- Plain JSON file persistence (`sessions.json`) for lightweight state
- Shell: Windows `cmd` / PowerShell / Git Bash for process management

**技巧 / Tips**
- Node ESM 要求本地匯入附上副檔名：`import x from './x.js'`。
- 在 ESM 模式下用 `fileURLToPath(import.meta.url)` 取得 `__dirname`，跨平台（Windows）更可靠。
- 若發生 `require is not defined`，代表仍有 CommonJS 殘留，改為 `import` 或使用動態 `await import()`。
- 當開發多個 server 實例時，先檢查埠占用：`netstat -ano | findstr :3000`，再用 `taskkill /PID <pid> /F /T` 終止。
- 在非破壞性遷移時，保留原始實作供比對，並在完成驗證後才刪除或封存。

**難題與解法 / Challenges & Solutions**
- ESM / CommonJS 混用導致啟動錯誤：把所有 server 檔案統一改為 ESM，並確保 `.js` 副檔名。
- Windows 路徑怪異（`new URL(import.meta.url).pathname` 會出現重複 drive prefix）：改用 `fileURLToPath` + `path.dirname`。
- 開發期間多次啟停造成埠被占用：使用 `netstat` + `taskkill` 定位並清除殘留進程；在必要時重啟系統作最後手段。
- shell 混用（Git Bash vs cmd）造成命令 quoting/背景化問題：針對系統命令切換到原生 `cmd` / PowerShell 執行以取得正確結果。

**Smoke test commands (examples)**
- Start server (inside `sv-app`):
  - `cd sv-app` 
  - `node server/index.js`
- Check API:
  - `curl http://localhost:3000/api/sessions`
- Stop server (Windows):
  - `netstat -ano | findstr :3000` to get PID
  - `taskkill /PID <pid> /F /T`

**下一步建議 / Next steps**
1. 把 smoke tests 自動化成 script（放在 `sv-app/scripts/smoke.sh` 或 `smoke.ps1`），包含 API 檢查與 socket 測試。 
2. 建立小型整合測試（使用 Playwright 或 Node 測試腳本）來覆蓋 `/api/sessions` 與基本 socket 流程。
3. 若希望更穩健，替換 JSON file persistence 為輕量 DB（e.g. SQLite 或 LowDB），並加入錯誤處理與備份機制。
4. 若希望檔案數少且偏好單檔模式，可把 `mbti.js` 與 `socket.js` 合併回 `server/index.js`，但會犧牲模組分離的好處。

**決策記錄 / Decisions**
- 所有變更限定於 `sv-app/server`（root `server` 保留為 reference，未做修改）。
- 優先可運行、ESM 相容與跨平台路徑穩定性。 

**Contact / Notes**
- 我已在本地執行並驗證基本 smoke test（GET `/api/sessions`）。如需我將 smoke 測試寫成可執行腳本或新增 socket 自動測試，請告知。

----
Generated on: 2026-04-13

**新增：Smoke-test 腳本與使用說明**
- 我已在 `sv-app/scripts/smoke-test.js` 新增一個 Node.js smoke 測試腳本，會在需要時啟動 `sv-app` 伺服器（於 `sv-app/server`），執行以下檢查，並在完成後停止該測試伺服器：
  - 檢查 `GET /api/sessions` 回應為 JSON
  - 透過 Socket.IO 連線並等待 `state` 事件
  - 發送 `submit_mbti`（測試用的 MBTI，例如 `INTJ`），驗證收到 `lucky_color` 與 `spawn_particles` 事件

- 腳本路徑：`sv-app/scripts/smoke-test.js`
- 直接執行（repo 根目錄）：
  ```bash
  node sv-app/scripts/smoke-test.js
  ```
- 或在 `sv-app` 内使用 npm script（若您希望我加入 `package.json` scripts，我可以幫忙但我不會自動提交）：
  ```bash
  cd sv-app
  npm run smoke
  ```

- 執行結果：我在本地已成功執行一次，API 與 socket 事件皆通過；腳本會在結束後自動停止由它啟動的伺服器實例。

如果您要我把使用說明也加入 `sv-app/README.md` 或把 `smoke` script 恢復到 `sv-app/package.json`（並提交），請告訴我。
