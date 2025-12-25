import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.EVM_PRIVATE_KEY as `0x${string}`;
if (!privateKey) throw new Error("EVM_PRIVATE_KEY is required");

const signer = privateKeyToAccount(privateKey);

// x402 client
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// fetch をラップ（402 → 認可生成 → verify → 再リクエスト）
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

(async () => {
  const res = await fetchWithPayment("http://localhost:4021/paid", {
    method: "GET",
  });

  console.log("status:", res.status);
  console.log("body:", await res.json());

  // 決済結果（settle が行われた場合）
  const httpClient = new x402HTTPClient(client);
  const paymentResponse = httpClient.getPaymentSettleResponse((name) =>
    res.headers.get(name),
  );
  console.log("payment response:", paymentResponse);
})();
