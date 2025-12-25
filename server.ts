import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();

// 受け取り先アドレス（EVM）
const payTo = process.env.PAY_TO as `0x${string}`;
if (!payTo) throw new Error("PAY_TO is required");

// Facilitator
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

// Resource Server に exact / EVM を登録
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  "eip155:84532", // Base Sepolia
  new ExactEvmScheme(),
);

// 有料エンドポイント
app.use(
  paymentMiddleware(
    {
      "GET /paid": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:84532",
            payTo,
          },
        ],
        description: "x402 v2 minimal demo",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.get("/paid", (_req, res) => {
  res.json({ message: "paid content" });
});

app.listen(4021, () => {
  console.log("Server running at http://localhost:4021");
});
