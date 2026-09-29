# GitHub Activity Report for HR Review

## 1. Report purpose

本報告整理 GitHub repository `snowfallsout/inklumina` 中可由 GitHub 原生資料驗證的活動，供 HR 核對與保存使用。個人識別帳號為 [`@SwLok0`](https://github.com/SwLok0)。

## 2. Period and scope

- **期間：** 2024-05-01 至 2026-09-29（報告產製日）
- **Repository：** [`snowfallsout/inklumina`](https://github.com/snowfallsout/inklumina)
- **資料擷取：** 2026-09-29
- **納入：** commits、pull requests、merged pull requests、reviews、issues、comments，以及與 `@SwLok0` 直接相關的 Agent 活動
- **排除：** 其他 repository、無法確認作者的活動、與 `@SwLok0` 無直接關聯且非 Agent/官方系統活動

## 3. Data sources and calculation method

資料來自 GitHub repository 的 commits history、pull request records、pull request reviews/comments 與 issues search。日期採 GitHub API 回傳的 ISO 8601 timestamp；統計以事件筆數計算，不將同一 pull request 的建立、合併與 review 合併為單一事件。所有明細均保留 GitHub 原生 URL。

## 4. Summary statistics

| Metric | Count | Calculation / note |
|---|---:|---|
| `@SwLok0` authored commits | 20 | GitHub commit author login = `SwLok0` |
| Agent/Copilot authored commits | 3 | GitHub commit author login = `Copilot` |
| `@SwLok0` authored pull requests | 3 | PR #1–#3 |
| `@SwLok0` merged pull requests | 8 | PR #1, #2, #3, #5, #6, #7, #9, #10 |
| Agent/Copilot pull requests | 5 | PR #6–#10; #8 was closed without merge |
| Copilot review records | 8 | PR #1, #2, #3, #6, #7, #8, #9, #10 |
| Issues authored by `@SwLok0` | 0 | GitHub issues search |
| Identifiable comments by `@SwLok0` | 0 | GitHub PR/issue commenter search and PR comment records |

## 5. Monthly statistics

| Month | `@SwLok0` commits | Agent commits | `@SwLok0` PRs opened | PRs merged by `@SwLok0` | Copilot reviews |
|---|---:|---:|---:|---:|---:|
| 2026-04 | 20 | 3 | 3 | 8 | 8 |

No qualifying events were returned for 2024-05-01 through 2026-03-31 or 2026-05-01 through 2026-09-29.

## 6. Activity details

### 6.1 Pull requests

| Date | Activity type | Repository | Title / summary | Status | URL | Note |
|---|---|---|---|---|---|---|
| 2026-04-10 | Pull request opened and merged | snowfallsout/inklumina | feat: add particle art display with MBTI integration | Merged; authored and merged by `SwLok0` | [PR #1](https://github.com/snowfallsout/inklumina/pull/1) | First user-authored implementation PR |
| 2026-04-10 | Pull request opened and merged | snowfallsout/inklumina | feat: add particle art display with MBTI integration | Merged; authored and merged by `SwLok0` | [PR #2](https://github.com/snowfallsout/inklumina/pull/2) | User-authored TypeScript/server implementation |
| 2026-04-10 | Pull request opened and merged | snowfallsout/inklumina | feat: add mobile interface for MBTI color visualization and session management | Merged; authored and merged by `SwLok0` | [PR #3](https://github.com/snowfallsout/inklumina/pull/3) | User-authored mobile/session implementation |
| 2026-04-12 | Pull request merged | snowfallsout/inklumina | Feature/acid glassmorphism | Merged by `snowfallsout`; not counted as `SwLok0` activity | [PR #4](https://github.com/snowfallsout/inklumina/pull/4) | Repository context only |
| 2026-04-12 | Pull request merged | snowfallsout/inklumina | Feature/acid glassmorphism | Merged by `SwLok0` | [PR #5](https://github.com/snowfallsout/inklumina/pull/5) | Author: `snowfallsout`; direct user merge activity |
| 2026-04-14 | Agent pull request merged | snowfallsout/inklumina | SvelteKit audit: full project review — build fixes, security hardening, and ops cleanup | Merged by `SwLok0` | [PR #6](https://github.com/snowfallsout/inklumina/pull/6) | Author: `Copilot`; user listed as assignee |
| 2026-04-16 | Agent pull request merged | snowfallsout/inklumina | fix: restore package.json, move server to SvelteKit-native src/, fix display loading + detect div z-index | Merged by `SwLok0` | [PR #7](https://github.com/snowfallsout/inklumina/pull/7) | Author: `Copilot`; user listed as assignee |
| 2026-04-16 | Agent pull request closed | snowfallsout/inklumina | Refactor Colorfield to Minimal Svelte 5 App with Single `npm start` Runtime | Closed, not merged | [PR #8](https://github.com/snowfallsout/inklumina/pull/8) | Author: `Copilot`; user listed as assignee |
| 2026-04-21 | Agent pull request merged | snowfallsout/inklumina | [WIP] Add offline single-file demo for Colorfield | Merged by `SwLok0` | [PR #9](https://github.com/snowfallsout/inklumina/pull/9) | Author: `Copilot`; user listed as assignee/reviewer |
| 2026-04-21 | Agent pull request merged | snowfallsout/inklumina | feat(demo): move offline app.html to repo root and serve via /app.html | Merged by `SwLok0` | [PR #10](https://github.com/snowfallsout/inklumina/pull/10) | Author: `Copilot`; user listed as assignee/reviewer |

### 6.2 Commits directly attributable to `@SwLok0`

| Date | Activity type | Repository | Title / summary | Status | URL | Note |
|---|---|---|---|---|---|---|
| 2026-04-10 | Commit | snowfallsout/inklumina | feat: add particle art display with MBTI integration | Present in history | [d481acf](https://github.com/snowfallsout/inklumina/commit/d481acfaf8e013c88bcbb50510611e884793acfb) | PR #1 merge commit |
| 2026-04-10 | Commit | snowfallsout/inklumina | Merge pull request #2 | Present in history | [d39f704](https://github.com/snowfallsout/inklumina/commit/d39f70484af9517e6a849a4e93b454617fdd8473) | PR #2 merge commit |
| 2026-04-10 | Commit | snowfallsout/inklumina | feat: add mobile interface for MBTI color visualization and session management (#3) | Present in history | [9e789dd](https://github.com/snowfallsout/inklumina/commit/9e789dd1b241878d4764c05416aa293047d932fc) | PR #3 merge commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update server.js | Present in history | [d50a071](https://github.com/snowfallsout/inklumina/commit/d50a071bfa679bff0f3389ac60a7933e70729d83) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update app.html | Present in history | [16e8bf4](https://github.com/snowfallsout/inklumina/commit/16e8bf487705b7f498c105468db57b5b822fb12c) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update app.html | Present in history | [4f143e0](https://github.com/snowfallsout/inklumina/commit/4f143e0f5ac5dc19c4b72e43cd5de714fc925411) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [c46932f](https://github.com/snowfallsout/inklumina/commit/c46932fd91421c62724c000bdb6555e3a659bb45) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [f20e07b](https://github.com/snowfallsout/inklumina/commit/f20e07bb8acffb7630755300bf7945216014a777) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [3ad6ed1](https://github.com/snowfallsout/inklumina/commit/3ad6ed1275e114fc01b0490332f61bee2037a242) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [8d92310](https://github.com/snowfallsout/inklumina/commit/8d92310051e13f56253580000364187f709b0a4e) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [051d520](https://github.com/snowfallsout/inklumina/commit/051d52038f58b874193315aae70d2a9fc961d434) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [785ca73](https://github.com/snowfallsout/inklumina/commit/785ca738e7d62e9bf46a687ab2f29119fe43a2d6) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [b69b2ab](https://github.com/snowfallsout/inklumina/commit/b69b2ab89a492bbe0eb3d3e295798944eaac20d5) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [0240247](https://github.com/snowfallsout/inklumina/commit/024024713c9bbb91821d153c3fc145c45d5693a0) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [c1cfaa9](https://github.com/snowfallsout/inklumina/commit/c1cfaa94f2f28aa13f5620e7f873009d8baa1462) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [7375cc7](https://github.com/snowfallsout/inklumina/commit/7375cc732f7aa122609764a85221906b1e7a90c3) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [289d8fb](https://github.com/snowfallsout/inklumina/commit/289d8fbb98296735e65a5affd2b35c38f96da544) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [b29b119](https://github.com/snowfallsout/inklumina/commit/b29b11931cb61330bfea2a71ebe1cf9c175a4f31) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Update README.md | Present in history | [b82d931](https://github.com/snowfallsout/inklumina/commit/b82d9314a43997abe952b083e7876fbd97ccf16f) | User-authored commit |
| 2026-04-21 | Commit | snowfallsout/inklumina | Merge pull request #10 | Present in history | [c113d31](https://github.com/snowfallsout/inklumina/commit/c113d318483556575ac54b53a0c66694a619289c) | User-authored merge commit |

### 6.3 Agent commits and reviews

| Date | Activity type | Repository | Title / summary | Status | URL | Note |
|---|---|---|---|---|---|---|
| 2026-04-21 | Agent commit | snowfallsout/inklumina | Initial plan | Present in history | [60f7179](https://github.com/snowfallsout/inklumina/commit/60f7179f365a0dd05cbd98aca697c1eecb009fa1) | Author: `Copilot` |
| 2026-04-21 | Agent commit | snowfallsout/inklumina | [WIP] Add offline single-file demo for Colorfield (#9) | Present in history | [bce1bf1](https://github.com/snowfallsout/inklumina/commit/bce1bf1ea3414efd22dfe2283363b2b0714d8dde) | Author: `Copilot` |
| 2026-04-21 | Agent commit | snowfallsout/inklumina | feat(demo): move offline single-file app.html to repo root and serve via /app.html | Present in history | [e05bb23](https://github.com/snowfallsout/inklumina/commit/e05bb23e4a4107672f40ec6ccd46bedf7f2192fa) | Author: `Copilot` |
| 2026-04-10–2026-04-21 | Review | snowfallsout/inklumina | Copilot review records on PR #1, #2, #3, #6, #7, #8, #9 and #10 | Submitted | [PR reviews](https://github.com/snowfallsout/inklumina/pulls?q=is%3Apr+reviewed-by%3Acopilot-pull-request-reviewer%5Bbot%5D) | Official GitHub Copilot reviewer; 8 records |

## 7. Limitations and notes

1. The repository’s qualifying GitHub activity begins in April 2026; no events were returned for the earlier portion of the requested period.
2. GitHub search returned no issues authored by `SwLok0` and no identifiable issue/PR comments authored by `SwLok0`. This does not prove that no historical event ever existed if an item was deleted, transferred, or is inaccessible to the API.
3. Commit author and committer are separate GitHub fields. Counts above use the GitHub `author.login`; merge commits can therefore appear under `SwLok0` even when the underlying pull request was authored by an Agent.
4. One commit in the 32-commit repository history had no resolvable author login in the returned API data and is excluded from personal attribution.
5. PR #4 is listed for repository completeness but excluded from `SwLok0` personal totals because it was authored and merged by `snowfallsout`.
6. This report is a point-in-time extraction. New GitHub activity after 2026-09-29 is not included.
