# 16colorfield

An interactive particle art installation.  
你的 MBTI 透過即時 WebSocket 與空間運算，轉換為流動的全息色域（fluid, holographic 16colorfield）。

---

## 簡介
16colorfield 是一個以互動粒子/色域為核心的視覺裝置專案。使用者的 MBTI（或其他輸入）會透過即時訊息映射為一組顏色與流動參數，驅動前端的粒子系統，呈現出可觸控、可投影、並可結合空間運算（例如 WebXR / device-orientation / 劇場投影）的動態色場。

主要語言：HTML, JavaScript

---

## 特色
- 即時互動：透過 WebSocket / web-sockets 接收使用者資料並即時更新視覺。
- 粒子色域：MBTI 或其它情緒 / 屬性映射為色彩與運動參數。
- 支援空間互動：設計上���整合裝置定位、WebXR 或感測器資料以產生更具沉浸感的效果。
- 可部署為靜態前端（GitHub Pages / Netlify）或搭配簡單 Node WebSocket 後端。

---

## Demo
（如有線上示範請放置連結）
示例：https://your-demo-url.example

---

## 快速開始

1. 取得專案
   git clone https://github.com/snowfallsout/16colorfield.git
   cd 16colorfield

2. 靜態預覽（若專案為純前端）
   - 直接在本機開啟 `index.html`
   - 或用簡單靜態伺服器，例如：
     - npx serve .
     - npx http-server .

3. 開發（若專案含 Node.js 後端）
   - 安裝依賴
     npm install
   - 啟動前後端（視專案腳本而定）
     npm run dev
     或
     npm start

註：專案可能沒有明確的 server；如果你有後端程式夾（例如 `server/`），請依該資料夾的 README 或 package.json 指令調整上述步驟。

---

## 範例 WebSocket 設定與訊息格式（範例）
若前端透過環境變數或設定檔指定 socket 位置，請使用例如：
- 環境變數：SOCKET_URL=ws://localhost:8080

範例傳入訊息（JSON）：
{
  "type": "mbti",
  "value": "INTJ"
}

範例事件：前端接收 mbti 後會映射到顏色 / 粒子密度 / 流速等參數：
{
  "type": "update",
  "payload": {
    "hue": 210,
    "saturation": 0.8,
    "flow": 0.6,
    "particleCount": 5000
  }
}

請依實際後端協定調整訊息格式，上述僅為範例。

---

## 使用說明（操控與設定建議）
- MBTI / 輸入來源：可設計為表單輸入、QR / 簡碼、或外部 API 傳入（例如現場互動裝置）。
- 互動方式：滑鼠拖曳 / 觸控改變流場方向；設備 orientation / WebXR 可用於空間導向的效果。
- 視覺參數：顏色映射、粒子數量、運動阻尼、噪聲尺度等均可透過 UI 或訊息動態調整。

---

## 建議的檔案結構（視實際專案調整）
- index.html
- /assets
  - images/, fonts/, shaders/
- /js
  - main.js
  - colorMap.js
  - socket-client.js
- /server (如果有)
  - index.js
  - package.json
- README.md
- LICENSE

---

## 部署建議
- 靜態前端：GitHub Pages、Netlify、Vercel（直接部署 HTML/CSS/JS）
- 前端 + WebSocket 後端：部署後端至支援 WebSocket 的平台（例如自架伺服器、Docker、或像 Fly / Heroku 類平台），前端仍可部署為靜態網站並指向後端的 socket URL。
- 若要整合空間運算（WebXR）請確保使用 HTTPS（安全上下文）與支援的裝置環境。

---

## 開發與貢獻
歡迎 pull requests、issues、以及貢獻交互設計與視覺優化。貢獻流程建議：
1. Fork 專案
2. 新分支：git checkout -b feat/描述
3. 提交 PR，描述變更與如何測試

請在 PR 中提供可重現的示例或錄影，以利審核視覺/互動改動。

---

## 授權（License）
請在此處加入專案授權（例如 MIT / Apache-2.0 / CC-BY-NC 等）。  
範例：MIT License — 若同意請建立 LICENSE 檔案並填入授權條款。

---

## 聯絡
作者：@snowfallsout  
專案��面：https://github.com/snowfallsout/16colorfield

---
