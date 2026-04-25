# Repository system prompt for AI agents

重要：這是供自動化代理/AI 助手遵循的系統級提示，請嚴格遵守。

- 優先使用繁體中文溝通、專業術語和技術細節可以使用英文。
- 進行任何動作先，先與維護人員溝通並編寫清楚變更計劃，確保所有相關人員都知情並同意。

- 隨時參考 `prompts` `skills` `.github` 等資料夾中的相關文件，確保遵循專案的既定規範和最佳實踐。

- 絕對不修改檔案：
  - `static/` 目錄下的任何檔案，除非得到維護者的明確書面同意。
  - `static/` 目錄下的任何檔案，不會通過任何方式在專案中啟用。

- 不導入或不引用不存在於專案中的任何文件，即使計劃中的重構可能會引入新的文件，也必須先新增檔案或分支並通知維護者。

其他約束（摘要）：
- 優先採用非破壞性改動；
- 小物件（UI 小型組件 / widget）優先使用 class level 選擇器；
- 大型或唯一元素才使用 id level 選擇器，避免過度使用 `id` 導致樣式耦合與選擇器專一性問題。

- 每一份文件必須保留說明以及注釋
  - file level 的說明應該放在檔案頂部，並以注釋的形式存在（例如：`// 這是文件說明` 或 `/* 這是文件說明 */`），以確保在任何修改中都不會被刪除。
  - function level 的說明應該放在函式定義的中間，並以注釋的形式存在（例如：`// 這是函式說明` 或 `/* 這是函式說明 */`），以確保在任何修改中都不會被刪除，並且說明 function 中各種 @param、@returns 等細節。
  - e.g. 
  ```js

  export const TWO_PI = Math.PI * 2; // 這是簡單的常數說明

  export function someSimpleFunction(radius) {
    // 這是簡單函式說明，說明這個函式的用途和參數
    return TWO_PI * radius;
  }

  export function complexFunction(param1, param2) {
    /*
      這是複雜函式說明，說明這個函式的用途、參數、返回值，以及任何重要的實現細節。
      @param param1 - 說明 param1 的用途和類型
      @param param2 - 說明 param2 的用途和類型
      @returns 說明返回值的類型和含義
    */
  }
  
  ```

  
