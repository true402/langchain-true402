# @true402.dev/langchain

true402 tools for **LangChain** — give your Base agent **pay-per-call on-chain safety** over [x402](https://x402.org): rug/honeypot checks, address safety, and deployer reputation. No account, no API key — the wallet is the identity (USDC on Base, gas sponsored by the facilitator).

```bash
npm i @true402.dev/langchain @langchain/core
```

```ts
import { createTrue402Tools } from '@true402.dev/langchain';

const tools = createTrue402Tools({ payerPrivateKey: process.env.PAYER_PRIVATE_KEY! });
// → add `tools` to any LangChain agent (createReactAgent, AgentExecutor, …)
```

The agent can now call, before it trades:

| Tool | What it does | ~price |
|---|---|---|
| `true402_token_report` | Composite **avoid / caution / ok** verdict for a Base ERC-20 (buy/sell honeypot sim + liquidity + ownership + rug activity) | $0.01 |
| `true402_token_safety` | Structural safety score 0–100 + flags | $0.005 |
| `true402_address_safety` | Profile + risk for any address before you send/approve/call it (proxy detection) | $0.005 |
| `true402_deployer_check` | Deployer reputation — who made the token + their track record | $0.008 |

`payerPrivateKey` is a Base wallet holding a little USDC. Without it the stalls still return their HTTP 402 price, so the agent can decide. Override `baseUrl` / `rpcUrl` in the options if self-hosting.

Powered by [true402](https://true402.dev) — the machine-native x402 marketplace on Base. Browse every stall at [/catalog](https://true402.dev/catalog).
