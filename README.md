# Ink Lumina — 墨境流光

## 🎨 Online Demo 👉 先看 Demo（不用安裝）：https://snowfallsout.github.io/inklumina/  


這個 demo 是「純前端」的展示頁（相機/粒子效果），不會儲存任何數據或上傳資料。若你想在本機跑完整伺服器版本，請往下看操作指引。

---

# inklumina — 🚀 給零經驗使用者的完全操作指南🚀

這份 README 針對「完全沒有開發經驗的小白」撰寫，步驟非常詳細，示範如何：
- 從 GitHub 網頁下載完整 repo ZIP（純 WebUI）⬇️  
- 在電腦上離線啟動「單檔 demo（app.html）」或啟動後端（Node）伺服器 🖥️  
- 用 Docker 跑（選用）🐳  
- 常見問題與排錯（一步一步）🔧

先決條件（只有部分流程需要）
- 若只想用「離線單檔 demo」，**不需要安裝任何軟體**（不過瀏覽器的相機在 file:// 模式可能被封鎖，請看下面說明）。  
- 若要啟動 Node 伺服器或用 Docker，需安裝 Node.js 或 Docker（後面有教學）。

目錄
1. 我想「只用瀏覽器」離線看 demo（純 WebUI）✅  
2. 我想在本機啟動 Node 伺服器（可多人、socket）🟦  
3. 我想用 Docker 啟動（選用）🐳  
4. 常見問題（相機無法使用、權限、端口佔用）❗  
5. 我完成後要怎麼關閉/停止？🛑

------------------------------------------------------------------
1) 純 WebUI（最簡單）— 下載 ZIP，雙擊就看（適合非技術使用者）🧑‍💻➡️🖱️
- 適合對象：你只想離線 demo、或把檔案給別人直接雙擊開啟看效果。
- 注意：某些瀏覽器對 file:// 開啟時會限制相機（getUserMedia）；如果你需要 camera 功能，請跟著「在本機啟動簡單靜態伺服器」步驟。

步驟（從零開始）
1. 打開瀏覽器，前往專案 GitHub 頁面（例如：https://github.com/snowfallsout/inklumina）  
2. 在頁面右上或綠色按鈕附近，按「Code」 → 選「Download ZIP」：  
   - 點 Code 按鈕 → 選 Download ZIP → 下載到你的電腦。📥
3. 解壓 ZIP 檔（在檔案總管 / Finder 上右鍵解壓）。📂
4. 在解壓後的資料夾裡找 `app.html`（或若沒有，找 `public/app.html` 或 `public/display.html`）。  
   - 推薦：若有 `app.html`（repo 根目錄），打開它；這是離線 demo 的單檔入口。  
   - 若只有 `public/display.html`，也可以打開，但 display.html 可能依賴 camera 與某些外部資源（看下方相機說明）。  
5. 雙擊 `app.html`（或右鍵 → 在瀏覽器中打開）。會在瀏覽器中顯示互動畫面。🎉

如果開啟後看不到相機效果（或功能受限），請繼續下方：
- 「瀏覽器限制提示」：部分瀏覽器（Chrome/Edge）在 file:// 下禁止相機或某些外部資源，會導致 Mediapipe 或 camera 無法使用。請參考下一段「在本機啟動簡單靜態伺服器」。

------------------------------------------------------------------
補充：在本機啟動簡單靜態伺服器（給相機使用、安全且簡單）📡
- 為什麼需要？當你要用相機（Mediapipe）時，某些瀏覽器要求頁面以 HTTP(S) 提供，而不是 file://。下面三種做法任選一。

選項 A — 用 Python（最簡單）🐍
- Windows / macOS / Linux 都適用（通常系統已有 Python）。
步驟：
1. 開啟「命令提示字元」或「終端機」。  
2. 切換到剛剛解壓的資料夾（例如 Downloads/inklumina）：  
   - Windows:
     ```
     cd C:\Users\<你的帳號>\Downloads\inklumina
     ```
   - macOS / Linux:
     ```
     cd ~/Downloads/inklumina
     ```
3. 啟動簡單伺服器：
   - 若 Python 3：
     ```
     python -m http.server 8000
     ```
4. 在瀏覽器打開：http://localhost:8000/app.html （或 /public/display.html）🔗

選項 B — 用 Node 的 http-server（需安裝 Node/npm）🟢
1. 安裝（若尚未安裝 Node，先安裝 Node.js）：
   ```
   npm install -g http-server
   ```
2. 啟動：
   ```
   http-server -p 8000
   ```
3. 打開瀏覽器：http://localhost:8000/app.html

選項 C — VS Code 的 Live Server（圖形化）🖼️
1. 安裝 VS Code（若沒裝），打開資料夾（File → Open Folder）。  
2. 安裝擴充套件 "Live Server"。  
3. 右鍵選 app.html → Open with Live Server。將自動在瀏覽器打開。

------------------------------------------------------------------
2) 在本機啟動 Node 伺服器（適合想用原本 socket 功能或部署）🔧
- 前提：你已安裝 Node.js（建議 v18+ 或 v20）。若未安裝，請到 https://nodejs.org/ 下載安裝。

步驟（詳細）
1. 開啟終端機 / 命令提示字元。  
2. 進到專案資料夾（解壓後或 clone 後）：
   ```
   cd C:\path\to\inklumina
   ```
3. 安裝套件：
   ```
   npm ci
   ```
   - 如果 `npm ci` 失敗，改用：
     ```
     npm install
     ```
4. 啟動伺服器（預設會跑在 3000 埠）：
   ```
   npm start
   ```
   - 畫面會輸出類似：
     ```
     Display  →  http://localhost:3000/display.html
     Mobile   →  http://192.168.x.x:3000/mobile.html
     ```
5. 在本機瀏覽器打開 `http://localhost:3000/display.html`，另一台設備或分頁可以打 `http://<你的局域網 IP>:3000/mobile.html` 加入互動。📶
6. 停止伺服器：在終端機按 Ctrl + C。

注意（socket 與多實例）
- 目前預設 session 會寫到本機 `sessions.json`（只存在該伺服器實例）。若要多機水平擴充，需使用 Redis adapter 或其它調整（進階，未在此教學內）。

------------------------------------------------------------------
3) 用 Docker 啟動（若你想用容器化）🐳
- 先安裝 Docker Desktop（Windows/Mac）或 Docker Engine（Linux）。

步驟（簡潔）
1. 在專案根目錄建立 Docker image（或使用已有人推的 image）：
   ```
   docker build -t inklumina:latest .
   ```
2. 啟動 container 並對應埠 3000：
   ```
   docker run -d -p 3000:3000 --name inklumina inklumina:latest
   ```
3. 打開瀏覽器：http://localhost:3000/display.html  
4. 停止 container：
   ```
   docker stop inklumina
   docker rm inklumina
   ```

------------------------------------------------------------------
4) 常見問題 & 排錯（絕對要看）🛠️

Q: 我雙擊 app.html 沒看到相機 / Mediapipe 不工作？  
A: 多半是因為使用 file:// 導致外部資源（Mediapipe CDN）或相機權限被瀏覽器封鎖。解法：
- 用「在本機啟動簡單靜態伺服器」（上面 Python 或 http-server）再開 http://localhost:8000/app.html。✅

Q: npm start 後顯示錯誤或找不到套件？  
A:
1. 確認 Node 已安裝（在終端機輸入 `node -v` 與 `npm -v`）。  
2. 若沒有，安裝 Node.js： https://nodejs.org/ 。  
3. 再執行 `npm ci`（或 `npm install`）。

Q: 我用 mobile.html 想讓手機連到電腦，但手機打不開 URL？  
A: 確認以下：
- 電腦與手機在同一個 Wi-Fi（同一子網）。  
- 防火牆允許 3000 埠或你有用 router NAT。  
- server.js 啟動時會在 console 顯示本機局域網 IP，使用該 IP + :3000/mobile.html。

Q: 想臨時讓外網訪問（分享給遠端朋友）？  
A: 建議使用 ngrok（快速且簡單）：
1. 下載 ngrok，登入並設定 auth token（ngrok 官方教學）。  
2. 在終端機執行： `ngrok http 3000`  
3. ngrok 會給你一個 public URL，分享該 URL。🔗  
注意：公開會有安全風險，請小心。

Q: 如何確認 app.html 是否為「純離線版本」？  
A: 打開 app.html 檔案 → 使用瀏覽器的「檢查（F12）」→ Console，看是否有 `localStorage` 讀寫或 AJAX/Fetch 呼叫；純離線版不會寫入 sessions.json，也不會做外網發送。

------------------------------------------------------------------
5) 我完成後要怎麼關閉/清理？🧹
- 如果用 Python/http-server：在終端機按 Ctrl+C 停止。  
- 如果用 `npm start`：在終端機按 Ctrl+C 停止。  
- 如果用 Docker：
  ```
  docker stop inklumina
  docker rm inklumina
  ```
- 若你在瀏覽器允許了相機，關閉該分頁或在網站設定移除相機權限。

------------------------------------------------------------------
快速小抄（你可以 copy-paste）📋

下載 repo zip（WebUI）
1. 在 GitHub repo 頁面按「Code」→「Download ZIP」  
2. 解壓 → 找到 `app.html` → 雙擊開啟

快速本地 http server（Python）
```bash
# 進入解壓資料夾
cd /path/to/inklumina
# 啟動
python -m http.server 8000
# 在瀏覽器打開
http://localhost:8000/app.html
```

快速啟動 Node server
```bash
cd /path/to/inklumina
npm ci
npm start
# 開啟 http://localhost:3000/display.html
```

快速 build & run Docker
```bash
docker build -t inklumina:latest .
docker run -d -p 3000:3000 --name inklumina inklumina:latest
# 開啟 http://localhost:3000/display.html
```
