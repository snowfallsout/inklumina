Approved for handoff on 2026-04-14.
Implementation handoff should create the approved root MAP_TREE_DEV notes document from this plan, without expanding scope beyond the documented sections.

## Plan: MAP_TREE_DEV Architecture

為目前的 Colorfield 專案建立一套可交接給 Agent 的多文件 MAP_TREE_DEV 規劃，目標是把 `routes` 收斂成薄入口，把可重用 UI 移到 `src/lib/components/*`，把不可見邏輯移到 `src/lib/features/*`，並保留 `src/lib/shared/*` 作為跨 display/mobile 的共享契約。依據目前專案狀態，`display` 已部分遷入 `src/lib/display/*`，因此規劃必須採用「先建立新樹、再用 shim/rewire 切換、最後再收斂舊路徑」的方式，避免再次出現雙重來源或大面積破壞。

**Requested deliverable**
- Root target file: `d:\02-station\_github\colorfield\sv-app\MAP_TREE_DEV_NOTES.md`
- Format: single markdown document that combines all of the following in one place:
  1. File-level migration mapping tables for display and mobile
  2. Agent-facing guardrails: forbidden files, cutover rules, shim policy, and change sequencing rules
  3. Separate execution subplans for display and mobile, but embedded as sections in the same root document
- Constraint for execution agent: create the root file only after copying the verified structure from this plan; do not invent additional scope outside the sections listed above

**Recommended root-file section order**
1. `# MAP_TREE_DEV_NOTES`
2. `## Mission and SvelteKit Constraints`
3. `## Forbidden Files and Change Boundaries`
4. `## Target Tree`
5. `## Display File Migration Map`
6. `## Mobile File Migration Map`
7. `## Agent Rules: Shim, Cutover, and Commit Scope`
8. `## Display Execution Plan`
9. `## Mobile Execution Plan`
10. `## Error, Debug, and Test Runbook`
11. `## Verification Checklist`
12. `## Cleanup Gates`

**Steps**
1. Phase 0 — Architecture freeze and doc pack definition: 先建立一套 MAP_TREE_DEV 文件包的骨架，至少包含「總覽與原則」、「目標樹」、「禁止修改清單」、「display 搬遷表」、「mobile 搬遷表」、「error/debug/test runbook」、「cutover checklist」。這一步先定義規則，不動功能。
2. Phase 0.1 — Record verified SvelteKit constraints: 在計劃中明確寫死以下事實，作為後續 Agent 的基本前提。`$lib` 是 SvelteKit 內建 alias，不需要在 `svelte.config.js` 額外設定；目前存在 `(app)` route group，這已是正確的 advanced routing 用法；目前專案沒有 `src/hooks.server.ts`、`src/hooks.client.ts`、`src/hooks.ts`，因此 hooks 屬於「可選後續能力」，不是此次重構的前置條件。*depends on 1*
3. Phase 0.2 — Freeze list before any migration: 在 MAP_TREE_DEV 的禁止修改文件中明確禁止本次架構整理直接編輯以下範圍，除非後續有單獨任務授權。`server/**`、`sessions.json`、現有 API 路由、`README.md`、根 layout 檔、任何 build/generated 輸出。對現有路由入口檔採「最小變更」原則：`+page.svelte`、`+page.ts`、`+layout.svelte` 只允許做 import rewiring、props pass-through、薄殼組裝，不允許重新塞回業務邏輯。*depends on 1*
4. Phase 1 — Define the target tree: 採用你已選定的結構，建立目標樹規則。Display UI 目標是 `src/lib/components/display/*`；Display feature logic 目標是 `src/lib/features/display/*`；Mobile 依同一原則對稱延伸為 `src/lib/components/mobile/*` 與 `src/lib/features/mobile/*`；跨 display/mobile 的事件契約、socket client、通用常數進入 `src/lib/shared/*`。此階段也要明文規定：目錄語意大於檔名語意，因此進入 `features/display/` 後不再保留 `display.` 前綴。*depends on 2,3*
5. Phase 1.1 — Current-to-target mapping table for display: 為現有 display 檔案建立逐檔對照表。`src/routes/(app)/display/components/DisplayFooter.svelte`、`DisplayHeader.svelte`、`DisplayHud.svelte`、`DisplayLegend.svelte`、`DisplaySessionManager.svelte`、`DisplayFrame.svelte` 對應到 `src/lib/components/display/*`；`src/lib/display/runtime/*`、`src/lib/display/session/*`、`src/lib/display/state.ts`、`src/lib/display/types.ts`、`src/lib/display/constants.ts` 對應到 `src/lib/features/display/*`；`src/lib/shared/contracts.ts` 與 `src/lib/shared/socket-client.ts` 保持在 shared。這張表要特別標記哪些檔案先用 re-export shim 保留相容路徑。*depends on 4*
6. Phase 1.2 — Current-to-target mapping table for mobile: 為 mobile 建立對照表。`src/routes/(app)/mobile/components/*` 對應到 `src/lib/components/mobile/*`；`src/routes/(app)/mobile/mobile.store.ts`、`mobile.realtime.ts`、`mobile-card.ts`、`mobile.constants.ts`、`mobile.utils.ts`、`mobile.types.ts` 對應到 `src/lib/features/mobile/*`。同時在這一步明文規定要消除重複型別：`MbtiCode`、`LuckyColorPayload` 以 `src/lib/shared/contracts.ts` 為唯一來源，mobile 側改用 import，不再自建同名型別。*parallel with 5 after 4*
7. Phase 2 — Display migration strategy: 先新增 `src/lib/components/display/*` 與 `src/lib/features/display/*` 的新檔，再把現有 `src/routes/(app)/display/+page.svelte` 保持為薄入口，只做組裝與 data hydrate；現有 `src/routes/(app)/display/+page.ts` 保持為 page data 提供者。Display 的 runtime 初始化以現有 `initDisplayRuntime` 為中心，但切換到新的 feature 路徑時，先用 compatibility shim 保護 import graph，不做一步到位刪除。*depends on 5*
8. Phase 2.1 — Display runtime refactor guardrails: 對 `display` runtime 明文分兩層執行。第一層只移動檔案與 import，不改行為；第二層才逐步把 `document.getElementById` / `window.alert` / `window.confirm` / 直接 DOM 寫入，收斂成 Svelte component props、events、`bind:this`、store-driven UI。這一步要把 `src/lib/display/runtime/dom.ts`、`gesture.ts`、`legacy.ts`、`src/lib/display/session/panel.ts`、`qr.ts` 標成高風險區。Agent 不得在同一個 PR 同時做「檔案搬家」與「DOM 模式重寫」。*depends on 7*
9. Phase 2.2 — Route-shell end state for display: `src/routes/(app)/display/` 最終只保留 `+page.svelte`、`+page.ts`、`+error.svelte`、必要的 route-scoped CSS，以及極少量 route-only wrapper。若 `DisplayFrame` 被保留在 route 之外，route 內不得再有任何 display 業務邏輯 `.ts`。*depends on 7,8*
10. Phase 3 — Mobile migration strategy: 以 display 的切分規則複製到 mobile。`src/routes/(app)/mobile/+page.svelte` 與 `+page.ts` 保持薄入口；`connectMobileRealtime`、`submitCurrentMbti`、`mobileState`、`computeCardGradient`、`renderMobileHoloCard` 等 symbol 遷移至 `src/lib/features/mobile/*`；`src/lib/components/mobile/*` 接收 props 和事件，不直接相依 route-local 模組。*depends on 6 and can start after 7 is stable*
11. Phase 3.1 — Mobile type and contract hardening: 在 mobile 端消除與 shared 重複的協定型別，把 `MbtiCode`、`LuckyColorPayload` 統一回 `src/lib/shared/contracts.ts`，僅保留 mobile 特有 view-model 型別於 `src/lib/features/mobile/types.ts`。這一步要特別避免出現 display/constants 與 shared/contracts 的雙重 `MbtiCode` 真相。*depends on 10*
12. Phase 4 — Shim and cutover policy: 在新樹完全穩定之前，舊路徑只允許存在兩種形式：re-export shim 或 route wrapper；不得保留第二份完整實作。每完成一批搬遷，就要決定是「保留 shim」還是「刪除舊檔」，不能讓 duplicated implementation 長期存在。這是為了避免現在已觀察到的 `display.session.client.ts` / `display.session.panel.ts` 式雙份內容再次出現。*depends on 7 and 10*
13. Phase 5 — Hooks policy aligned with SvelteKit docs: 不因為看到 hooks 文件就先加 hooks。只有在出現跨所有 routes 的需求時才新增。建議的 hooks 路線是：`src/hooks.client.ts` 用於全域 client error logging 與 runtime telemetry；`src/hooks.server.ts` 用於 request correlation ID、`event.locals` 注入或安全的 error normalization；目前不建議新增 `handleFetch`、`reroute` 或 transport，因為目前 `/api` 與 `/socket.io` 由 Vite proxy 和 backend 負責，沒有必要把路由重寫複雜化。*parallel with 7-12 as design rule*
14. Phase 5.1 — Advanced routing policy aligned with SvelteKit docs: 保留現有 `(app)` group，這已經符合 advanced layouts 的最佳實務。除非未來需要 admin/ops/embed 等不同 layout 層級，否則不要新增 `+page@` / `+layout@` breakouts；目前也不要引入 optional params、rest params、param matchers，因為現有 display/mobile 路徑不需要。*parallel with 13*
15. Phase 6 — Error, debug, and verification runbook: MAP_TREE_DEV 必須內建故障分類與處理流程。Import graph 問題先檢查 shim/re-export；畫面失效先檢查 route shell 是否仍在引用 route-local TS；socket 失效先檢查 `src/lib/shared/socket-client.ts`、`mobile.realtime`/display runtime 是否仍綁定舊路徑；DOM 錯位先回看 `bind:this` 轉換是否分開提交。靜態驗證至少跑 `npm run check`；系統連通至少跑 `npm run smoke`；結構性變更收尾時跑 `npm run build`。對 display/mobile 都要有人手動走一次完整流程。*depends on 7-14*
16. Phase 6.1 — Minimum manual test matrix: Display 至少驗證初始載入、session list、新建 session、QR 生成、camera 開關、socket 更新； Mobile 至少驗證 welcome → mbti → submit → result、socket 連線斷線、fallback 提交、圖片生成。每個矩陣都要同時記錄預期 UI、對應 store、對應 socket event。*depends on 15*
17. Phase 7 — Final cleanup and documentation sync: 當 route shells、new lib trees、shared contracts、shim policy 都穩定後，再做舊路徑清理與命名收斂。這一步才處理是否移除 legacy re-export、是否把 `src/lib/display/*` 舊樹完全收掉、是否新增 docs 入口索引。任何 cleanup 都必須以 `npm run check`、`npm run smoke`、必要時 `npm run build` 全綠為前提。*depends on 16*

**Relevant files**
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\display\+page.svelte` — 目前已是 display route shell，後續只能保持薄組裝
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\display\+page.ts` — display sample data loader，保留 page-data 職責
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\display\components\DisplayFrame.svelte` — 目前仍承擔 display 組裝，未來對應 components/display 的主容器
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\display\components\DisplayFooter.svelte` — G 手冊點名的第一個搬遷示範候選
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\mobile\+page.svelte` — mobile route shell，後續只負責 payload pass-through
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\mobile\+page.ts` — mobile page data provider，保留 route data 職責
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\mobile\mobile.store.ts` — 待搬遷的 mobile state source，核心 symbol 是 `mobileState`
- `d:\02-station\_github\colorfield\sv-app\src\routes\(app)\mobile\mobile.realtime.ts` — 待搬遷的 mobile realtime source，核心 symbol 是 `connectMobileRealtime` 與 `submitCurrentMbti`
- `d:\02-station\_github\colorfield\sv-app\src\lib\display\state.ts` — 既有 display state source，未來需映射到 features/display/state 類別位置
- `d:\02-station\_github\colorfield\sv-app\src\lib\display\runtime\index.ts` — 既有 runtime 入口，核心 symbol 是 `initDisplayRuntime`
- `d:\02-station\_github\colorfield\sv-app\src\lib\display\session\client.ts` — 既有 display session feature，後續只能保留一份真實實作
- `d:\02-station\_github\colorfield\sv-app\src\lib\display\session\panel.ts` — 高風險 DOM 直取區，後續需拆成組件事件/props
- `d:\02-station\_github\colorfield\sv-app\src\lib\display\session\qr.ts` — 高風險 DOM 與 localStorage 直取區
- `d:\02-station\_github\colorfield\sv-app\src\lib\shared\contracts.ts` — shared 契約唯一來源，mobile/display 不得再重複定義同名協定
- `d:\02-station\_github\colorfield\sv-app\src\lib\shared\socket-client.ts` — socket singleton/shared client
- `d:\02-station\_github\colorfield\sv-app\svelte.config.js` — 用來記錄 `$lib` 為內建 alias、runes 全域策略與 CSP 約束
- `d:\02-station\_github\colorfield\sv-app\vite.config.ts` — 記錄 `/api`、`/socket.io` proxy 邊界，hooks 計劃不可與此衝突
- `d:\02-station\_github\colorfield\sv-app\package.json` — 驗證矩陣所依賴的 `dev`、`dev:socket`、`check`、`smoke`、`build`

**Verification**
1. 規劃實施前先確認 `npm run check` 是基線綠燈，避免把既有錯誤混入重構範圍。
2. 每完成一批搬遷，只做一種變更類型：要嘛搬檔與修 import，要嘛做 DOM/store 重構，不可混合。
3. 每批搬遷後固定跑 `npm run check`。
4. 影響即時互動或 backend 通訊的批次，額外跑 `npm run smoke`。
5. 大型 cutover（例如 display tree 或 mobile tree 完整切換）收尾時跑 `npm run build`。
6. 手動驗證 display 與 mobile 主流程，並逐項對照各自的 state、socket event 與頁面載入。
7. 若新增 hooks，必須額外驗證 SSR/CSR 邊界、error serialization、以及沒有破壞現有 proxy 與 route group 行為。

**Decisions**
- 已對齊目標結構為你指定的精準手冊版：`src/lib/components/display` + `src/lib/features/display` + `src/lib/shared`；為了避免 display/mobile 架構不對稱，規劃同步延伸出 `src/lib/components/mobile` 與 `src/lib/features/mobile`。
- `routes` 的角色定義為 entry shell，不是邏輯倉庫；`+page.svelte` / `+page.ts` 保留 route concerns，非 route concerns 一律搬出。
- `$lib` 視為 SvelteKit 內建能力，不在 `svelte.config.js` 追加自定 alias。
- Hooks 採「有跨 route 需求才新增」策略，不把 hooks 當作結構整理的預設工具。
- 任何舊檔保留都只能是 shim/re-export，不允許長期雙份實作。
- 依照既有使用者偏好，本次規劃採 additive migration 思維：優先新增新檔、建立 shim、最後才刪舊檔，而不是先大刪再補。

**Further Considerations**
1. 建議把 MAP_TREE_DEV 實作分成兩個大 milestone：先完成 display，確認 route-shell + components/features/shared 模式順手，再把同一模板套到 mobile，這樣錯誤面最小。
2. 建議在 display 第二階段才處理 `bind:this` 與 DOM query 替換；第一階段只搬家，不做行為改寫，否則 debug 成本會失控。
3. 建議把「禁止修改清單」單獨列成一份文件，讓任何 Agent 開工前先讀它，避免再碰到 server/API/README 或 root layout 這類本輪不該動的檔案。
