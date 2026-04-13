# Display Route 操作驗收腳本

## 1. 測試目標
驗證 `src/routes/(app)/display` 已完成從舊版 `colorfield-main/public/display.html` 的功能搬遷，且互動行為一致。

## 2. 前置條件
- Node.js 可正常執行（建議 20+）。
- 同一個區網可用來做手機 QR 驗證。
- 測試機可授權相機使用。
- 若要驗證 Socket 流程，需同時開啟 mobile 端進行 MBTI 提交。

## 3. 啟動步驟
1. 在專案根目錄執行 `bun run dev:socket`（啟動 Socket/API 伺服器，預設 `:3000`）。
2. 另開一個終端執行 `bun run dev`（啟動 SvelteKit dev server，預設 `:5173`）。
3. 開啟瀏覽器進入 `http://localhost:5173/display`。
4. 開啟 DevTools Console，確認沒有紅色錯誤。

## 4. 驗收案例

### TC-01 首頁結構與靜態 UI
1. 進入 `/display`。
2. 檢查頁面是否可見：Header、Legend、Footer、Session 按鈕、Waiting 文案。
預期結果：
- 畫面排版完整。
- 背景 noise overlay 存在。
- Canvas 鋪滿全螢幕。

### TC-02 相機開關
1. 點擊右上角 camera toggle 按鈕。
2. 再點一次切回。
預期結果：
- 按鈕文字在 `◎ 摄像头 OFF` 與 `◎ 摄像头 ON` 間切換。
- 按鈕會套用/移除 `on` 狀態樣式。

### TC-03 人臉偵測 Badge
1. 允許相機權限。
2. 將臉進入鏡頭範圍。
預期結果：
- 左上角 badge 從 `● FACE TRACKING` 變為偵測狀態。
- 偵測不到相機時顯示 `● NO CAMERA`。

### TC-04 微笑 Emoji 效果
1. 對鏡頭微笑。
2. 停止微笑。
預期結果：
- 微笑時會出現單例 emoji，位置跟隨臉部。
- 不笑時 emoji 淡出。

### TC-05 手部骨架與捏合檢測
1. 將手伸入鏡頭。
2. 進行食指與拇指捏合動作。
預期結果：
- Canvas 上可見手部骨架線與關節點。
- `hand-badge` 顯示距離與捏合狀態（含 🤌）。

### TC-06 Draw Mode 狀態機
1. 持續捏合並穩定停留，等待 gathering。
2. 進入 drawing 後移動手勢。
3. 放開捏合。
預期結果：
- 狀態依序經過 gathering → drawing → dissolving。
- drawing 時有發光軌跡。
- 放開後粒子散開並回復 idle。

### TC-07 Session 面板開關
1. 點擊底部 `⊕ 新场次 / 历史`。
2. 點擊關閉按鈕 `×`。
3. 再次開啟後點擊遮罩空白區域。
預期結果：
- 面板可正常開關。
- 點遮罩可關閉。

### TC-08 新場次建立
1. 開啟 Session 面板。
2. 輸入活動名稱後點 `开始新场次`。
3. 確認對話框。
預期結果：
- 呼叫 `/api/sessions/new` 成功。
- 面板行為符合舊版邏輯（IP 已填則刷新 QR，未填則關閉）。

### TC-09 歷史列表 / 查看 / 刪除
1. 開啟 Session 面板並等待歷史載入。
2. 點擊某筆 `查看`。
3. 點擊某筆 `删除` 並確認。
預期結果：
- 歷史可顯示名稱、時間、人數。
- 查看會跳出詳細 alert。
- 刪除成功後該列移除。

### TC-10 Join QR 生成（面板內）
1. 在 IP 輸入框填入區網 IP（例如 `192.168.0.68`）。
2. 點擊 `生成二维码`。
預期結果：
- `sp-qr-wrap` 顯示。
- 產生可掃描 QR。
- `sp-qr-url` 顯示 `http://<ip>:<port>/mobile.html`。

### TC-11 Corner QR 同步
1. 完成 TC-10。
2. 檢查右下角 corner QR 區塊。
預期結果：
- 右下角 QR 同步更新。
- 顯示 canvas 版本 QR，img fallback 隱藏。

### TC-12 localStorage 回填
1. 完成 TC-10 後重新整理 `/display`。
2. 開啟 Session 面板。
預期結果：
- `sp-ip-input` 自動回填上次儲存 IP。
- Corner QR 在頁面載入後自動恢復。

### TC-13 Socket 即時互動（與 mobile 聯測）
1. 手機端開啟 `/mobile.html` 並提交 MBTI。
2. 觀察 display 端畫面。
預期結果：
- 收到 `spawn_particles` 後粒子爆發。
- Legend 計數、比例與 Total 更新。
- Waiting 文案可隱藏。
- 顯示 join toast。

### TC-14 Session Reset
1. 在 display 端建立新場次，觸發 reset。
2. 觀察畫面狀態。
預期結果：
- MBTI count 重置。
- 非 ambient 粒子清除。
- `total-num` 回到 0。
- waiting 文案回復。

### TC-15 腳本載入完整性
1. 開啟 Network 面板並重新整理 `/display`。
2. 過濾關鍵字 `display-`。
預期結果：
- 所有 `display-*.js` 皆為 200。
- 無 `ReferenceError` 或 `is not defined`。

## 5. 驗收結論模板
請填寫：
- 環境：
- 日期：
- 驗收人：
- 通過案例數 / 總案例數：
- 阻塞案例：
- 備註：
