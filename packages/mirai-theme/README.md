# mirai-theme

共有テーマパッケージは CSS 変数と TypeScript トークンを提供し、アプリ間で統一されたデザインを実現します。

## 使い方

1. インストール後、グローバル CSS でインポートします。

   ```css
   @import "mirai-theme/index.css";
   ```

2. Tailwind v4 のクラスで CSS 変数を参照します。

   ```html
   <button class="bg-[var(--color-primary-500)] text-white rounded-[var(--radius-md)]">
     計算する
   </button>
   ```

3. グラフや SVG 用のカラートークンを TypeScript から取得します。

   ```ts
   import tokens from "mirai-theme";

   console.log(tokens.sankey.income); // #2AA693
   ```

## テーマについて

2025年10月現在、`mirai-theme` はライトテーマのみを提供し、CSS 変数はルート要素に直接適用されます。アプリケーション側でテーマクラスを切り替える必要はありません。

`mirai-theme/src/components.css` には Button/Input/Card などのレシピが含まれます。必要に応じて `@apply` でカスタマイズしてください。
