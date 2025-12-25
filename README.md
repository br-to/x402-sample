# x402-sample

x402 v2 の最小実装デモ - exact/EVM on Base Sepolia

## 概要

このプロジェクトは、x402 v2 の最小構成を実装したサンプルです。

- **API（Seller）**: Node.js + Express
- **決済スキーム**: exact / EVM
- **ネットワーク**: Base Sepolia（eip155:84532）
- **Facilitator**: 公式の HTTP Facilitator

## セットアップ

```bash
pnpm install
```

## 環境変数の設定

`.env.example` を参考に `.env` ファイルを作成してください。

```bash
# Seller側（APIサーバー）
PAY_TO=0xYourAddress

# Buyer側（クライアント）
EVM_PRIVATE_KEY=0xYourBuyerPrivateKey
```

## 使い方

### 1. APIサーバーを起動

```bash
PAY_TO=0xYourAddress pnpm run dev:server
```

サーバーは `http://localhost:4021` で起動します。

### 2. 未払い状態でエンドポイントにアクセス

```bash
curl -i http://localhost:4021/paid
```

この時点では、**402 Payment Required** が返ります。

- オンチェーン送金は起きていない
- API は「条件」を提示しただけ

### 3. クライアントから認可を作成してアクセス

```bash
EVM_PRIVATE_KEY=0xYourBuyerPrivateKey pnpm run dev:client
```

ここで起きているのは：

1. 402 + accepts を受け取る
2. 条件を満たす **認可（authorization）** を生成
3. Facilitator による `/verify` 相当の検証
4. 検証 OK なら API がアクセスを許可

### 4. /settle について

この最小構成では：

- 検証が通ったタイミングで
- 必要に応じて `/settle`（実際の送金）まで進みます

ただし重要なのは：

- **x402 v2 では `/settle` は必須ではない**

セッション開始時だけ決済する、一定回数まとめて決済する、しばらくは verify のみで通す、といった設計も、API 側の判断で可能になります。

## この最小実装で分かること

実際に触ってみると、次がはっきりします：

- **402 は「支払い要求」ではなく 条件提示**
- **アクセス可否は 認可の妥当性で決まる**
- **決済は アクセス制御の裏側で起きる副作用**

「HTTP で支払う」とは、**HTTP で認可を扱い、決済は必要なときだけ行う**という意味です。

## 技術スタック

- Node.js + Express
- TypeScript
- @x402/core
- @x402/express
- @x402/evm
- @x402/fetch
- viem
