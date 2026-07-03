import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { payStall, type PayOpts } from './x402';

/**
 * true402 tools for LangChain — pay-per-call on-chain safety for Base agents, over x402 (USDC on Base,
 * no account, no API key; the wallet is the identity). Add them to any LangChain agent so it can
 * rug-check a token before trading.
 *
 *   import { createTrue402Tools } from '@true402.dev/langchain';
 *   const tools = createTrue402Tools({ payerPrivateKey: process.env.PAYER_PRIVATE_KEY! });
 */
export { payStall, type PayOpts } from './x402';

const tokenSchema = z.object({ token: z.string().describe('A Base ERC-20 token contract address (0x…)') });
const addressSchema = z.object({ address: z.string().describe('Any Base address (0x…) — an EOA or a contract') });

export function createTrue402Tools(opts: PayOpts): DynamicStructuredTool[] {
  return [
    new DynamicStructuredTool({
      name: 'true402_token_report',
      description:
        'Pre-trade rug/honeypot check for a Base ERC-20: a composite avoid/caution/ok verdict from an on-chain buy/sell honeypot simulation, liquidity depth, ownership/mint inspection, and recent rug activity. Call BEFORE buying a token. ~$0.01 USDC over x402.',
      schema: tokenSchema,
      func: async ({ token }) => JSON.stringify(await payStall('/v1/base/token-report', { token }, opts)),
    }),
    new DynamicStructuredTool({
      name: 'true402_token_safety',
      description:
        'Structural safety score (0–100) + flags for a Base ERC-20: honeypot simulation, liquidity, mint/ownership/blacklist. Lighter than token_report. ~$0.005 USDC over x402.',
      schema: tokenSchema,
      func: async ({ token }) => JSON.stringify(await payStall('/v1/token-safety', { token }, opts)),
    }),
    new DynamicStructuredTool({
      name: 'true402_address_safety',
      description:
        'Profile + risk for any Base address before you send to / approve / call it: EOA-vs-contract, ETH+USDC balance, activity, ownership, and upgradeable-proxy (EIP-1967) detection. ~$0.005 USDC over x402.',
      schema: addressSchema,
      func: async ({ address }) => JSON.stringify(await payStall('/v1/base/address-safety', { address }, opts)),
    }),
    new DynamicStructuredTool({
      name: 'true402_deployer_check',
      description:
        "Deployer reputation for a Base token: resolves who created it and that wallet's track record (age, contracts shipped, fresh-throwaway flag) to catch serial ruggers a structural check can't see. ~$0.008 USDC over x402.",
      schema: tokenSchema,
      func: async ({ token }) => JSON.stringify(await payStall('/v1/base/deployer-check', { token }, opts)),
    }),
  ];
}
