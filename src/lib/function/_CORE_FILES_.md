<!--
  _CORE_FILES_.md
  說明：記錄 `src/lib/function` 在目前 service-centric 架構下的剩餘角色，避免把 historical reference 與 active kernel 混為一談。
  注意：此文件為開發說明，不會被程式引用。
-->

# Function Folder Overview

## 現況摘要

`src/lib/function` 不再承擔 display runtime 的 bootstrap / realtime / camera / session owner。

這些 owner 已移到：

- `src/lib/services/display/runtime.ts`
- `src/lib/services/display/realtime.ts`
- `src/lib/services/display/camera.ts`
- `src/lib/services/display/legacy.ts`
- `src/lib/services/display/session.ts`
- `src/lib/services/display/types.ts`

目前 `src/lib/function` 的剩餘內容應理解為兩類：

1. active runtime kernel
2. historical reference

## Active Runtime Kernel

目前位於 `src/lib/function/runtime/` 的檔案應視為 display runtime kernel：

- `core.ts`
  - runtime state owner 與 kernel 組裝點
  - 對外提供粒子生成、draw loop 所需的共享狀態與 helper

- `draw.ts`
  - 畫布座標映射與低階繪製輔助

- `gesture.ts`
  - 手勢/情緒相關的 kernel 邏輯

- `particle.ts`
  - 粒子資料結構、更新與繪製行為

- `sprite.ts`
  - runtime sprite 使用邏輯

這一層應盡量避免再承擔：

- DOM bootstrap
- socket binding
- session flow
- camera service owner
- legacy window bridge

## Historical Reference

`src/lib/function` 目前已不再保留 active code 以外的 legacy JS monolith。

若需要追查原始行為基線，請以受保護的 `static/*` 檔案為準：

- `static/display.html`
- `static/mobile.html`
- `static/server.js`

## 已移除或已收編

- `function/session/*`
  - 已刪除，owner 已收斂到 `services/display/session.ts`

- `function/runtime/index.ts`
  - 已刪除，runtime public entry 已收斂到 `services/display/runtime.ts`

- `function/runtime/types.ts`
  - 已刪除，type owner 已收斂到 `services/display/types.ts`

- `function/runtime/legacy.ts`
  - 已刪除，legacy bridge owner 已收斂到 `services/display/legacy.ts`

- `function/runtime/realtime.ts`
  - 已刪除，realtime owner 已收斂到 `services/display/realtime.ts`

- `function/runtime/dom.ts`
  - 已刪除，bootstrap owner 已收斂到 `services/display/runtime.ts`

- `function/runtime/camera.ts`
  - 已刪除，camera owner 已收斂到 `services/display/camera.ts`

- `function/runtime/mediapipe.ts`
  - 已刪除，camera helper 已收編到 `services/display/mediapipe.ts`

- `function/runtime/cam.toggle.ts`
  - 已刪除，camera UI helper 已收編到 `services/display/cam.toggle.ts`

- `camAndMedia.js`
  - 已刪除，且無任何活躍引用

- `particleFull.js`
  - 已刪除，且無任何活躍引用
  - 原先的 reference 角色已由受保護的 `static/*` 檔案取代

## 後續建議

- 若 `function/runtime/` 確認長期只保留 kernel，可考慮未來改名為更語義化的目錄，但那應作為單獨的一輪結構調整。
- 若 `_CORE_FILES_.md` 持續存在，應讓它只記錄 active boundary，而不再重複歷史遷移細節。
