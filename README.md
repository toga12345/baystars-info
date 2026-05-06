# ⚾ ベイスターズINFO

横浜DeNAベイスターズのリアルタイム情報・成績・AI展望を提供するファンWebアプリ

## 機能

- **ホーム**: 今日の試合情報・直近成績・セ・リーグ順位表
- **成績**: 打者・投手の成績一覧（タブ切り替え）
- **スケジュール**: 月別試合スケジュール・結果
- **AI展望**: Google Gemini AIによる試合展望・シーズン分析

## セットアップ

```bash
# 1. 依存パッケージインストール
pnpm install

# 2. 環境変数設定
cp .env.local.example .env.local
# .env.local を編集して GEMINI_API_KEY を設定

# 3. 開発サーバー起動
pnpm dev
```

## Gemini APIキーの取得（無料）

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API key」をクリック
3. 「Create API key」で新規生成
4. `.env.local` の `GEMINI_API_KEY` に貼り付け

**無料枠**: 15リクエスト/分、100万トークン/日

## デプロイ (Vercel)

1. このリポジトリをGitHubにpush
2. [Vercel](https://vercel.com) でリポジトリを連携
3. Environment Variables に以下を設定:
   - `GEMINI_API_KEY`: GeminiのAPIキー
   - `NEXT_PUBLIC_BASE_URL`: VercelのデプロイURL

## 技術スタック

| 用途 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 + CSS Variables (Spindle準拠) |
| スクレイピング | Cheerio |
| AI | Google Gemini 1.5 Flash API |
| ホスティング | Vercel (無料枠) |
| CI/CD | GitHub Actions |

## データソース

- スポーツナビ プロ野球
- プロ野球データFreak
- NPB.jp 日本野球機構

※ 非公式ファンサイトです。
