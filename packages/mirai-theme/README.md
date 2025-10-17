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

## テーマ切り替え

ルート要素に `.theme-light` または `.theme-dark` を付与します。Next.js の `layout.tsx` などで初期クラスを設定し、ボタンで切り替えてください。

```tsx
document.documentElement.classList.toggle("theme-dark");
document.documentElement.classList.toggle("theme-light");
```

`mirai-theme/src/components.css` には Button/Input/Card などのレシピが含まれます。必要に応じて `@apply` でカスタマイズしてください。
