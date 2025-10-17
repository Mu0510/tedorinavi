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

## 新しいナビゲーション

- `/` はプロダクト紹介とティーザースライダーを備えたランディングページです。
- `/app` が結果ダッシュボードになり、KPI やグラフ、壁バッジをまとめて閲覧できます。
- 入力の変更は `/app` 内の「編集」シートで行い、保存後に再計算されます。

## 状態の共有と保存

- URL のクエリパラメータに入力内容をシリアライズしているため、リンク共有で同じ条件を再現できます。
- ブラウザの `localStorage` にも最新の入力とテーマ設定を保存し、リロード時に復元します。

## プライバシー

- 計算はすべてブラウザ内で処理され、入力値はサーバーに送信されません。
- 保存されるデータは `localStorage` のみで、ユーザー自身の端末に閉じています。

## パッケージ構成

- `packages/mirai-theme`: CSS 変数と TypeScript トークンを提供するテーマパッケージ
- `apps/webapp`: Next.js (App Router) + TypeScript + Tailwind v4 のフロントエンドアプリ

それぞれの詳細は各ディレクトリの README を参照してください。
