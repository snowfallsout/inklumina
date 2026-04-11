# colorfield

簡單說明

這是 colorfield 專案，一個以 Node.js 提供靜態檔案服務的小型示範專案。包含一個簡單的伺服器 `server.js`，以及兩個前端入口頁面 `public/display.html` 與 `public/mobile.html`。

主要功能

- 提供靜態網站內容（public/）
- 簡單可本地執行的 Node.js 伺服器

專案結構（重點）

- `server.js` - 啟動本地伺服器
- `public/display.html` - 桌面/展示版頁面
- `public/mobile.html` - 手機版頁面
- `package.json` - 專案依賴與啟動指令

需求

- Node.js（推薦 v16+ 或更新）

安裝

1. 在專案根目錄執行：

```
npm install
```

執行

1. 啟動伺服器：

```
node server.js
```

2. 開啟瀏覽器：

- 桌面/展示頁面：http://localhost:3000/display.html
- 手機頁面：http://localhost:3000/mobile.html

（預設伺服器埠號若不同，請參考 `server.js` 中設定）

貢獻

歡迎透過 issue 或 pull request 提案改進。這是一個小型 demo，請先開 issue 協調較大改動。

授權

採用 MIT 授權（請視需要替換為其他授權條款）。

---
若需要我幫你把 README 翻成英文、增加範例截圖或自動佈署說明，告訴我想要的內容即可。
