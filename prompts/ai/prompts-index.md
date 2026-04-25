<!--
  docs/ai/prompts-index.md
  目的：以人類可讀的形式索引 repository 中的 prompt 資產，並連結到 canonical `prompts/` 資料夾。
-->
# Prompts Index

此索引說明本專案中 prompt 的位置與用途。工程上 canonical 的 prompt 資料夾位於專案根目錄：`prompts/`（machine-readable、tests、版本化）。

概覽：

- **Canonical prompts 根目錄**： `prompts/`（包含 `system/`, `tasks/`, `tests/`, `v1/` 等）
- **人類可讀教學 / 範例**：放在 `docs/`（此檔即為索引）

重要檔案（快速連結）：

- Prompt 範本： [prompts/prompt_template.md](prompts/prompt_template.md#L1)
- Plan prompt 範例： [prompts/tasks/plan-mapTreeDevNotes.prompt.md](prompts/tasks/plan-mapTreeDevNotes.prompt.md#L1)
- Prompt tests： [prompts/tests/DISPLAY_ROUTES_TESTS.md](prompts/tests/DISPLAY_ROUTES_TESTS.md#L1)
- Prompts README（指導）： [prompts/README.md](prompts/README.md#L1)

管理建議（簡短）

- 機器可讀的 prompt（JSON/YAML）與測試請保留在 `prompts/`。
- 文件化的範例與審查記錄放在 `docs/`，並在本檔中索引。
- 修改 prompt 請走 PR，PR 描述中應包含 `version` 與 `last_review` 欄位的變更摘要。
- 機密不要放入 repository（使用 CI/Secrets 管理）。

下一步（建議）

- 若要清理重複檔案，我可以建立一個「移動/刪除建議映射」並產生 PR 範本，或直接為你準備 PR（非破壞性先複製、再移除）。
