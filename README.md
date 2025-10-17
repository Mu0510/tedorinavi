# 年収の壁シミュレーター Monorepo

このリポジトリは pnpm ワークスペース構成で、Next.js 製 Web アプリケーションと共有デザインテーマ `mirai-theme` を提供します。

## セットアップ

```bash
pnpm install
```

## 開発

- Web アプリの開発サーバー: `pnpm -C apps/webapp dev`
- すべてのパッケージをビルド: `pnpm -r build`
- 単体テスト (Vitest): `pnpm -r test`
- E2E テスト (Playwright): `pnpm -C apps/webapp e2e`

## パッケージ構成

- `packages/mirai-theme`: CSS 変数と TypeScript トークンを提供するテーマパッケージ
- `apps/webapp`: Next.js (App Router) + TypeScript + Tailwind v4 のフロントエンドアプリ

それぞれの詳細は各ディレクトリの README を参照してください。
