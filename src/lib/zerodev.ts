// ZeroDev — Account Abstraction, gas sponsorship, session keys
// Docs: https://docs.zerodev.app/
// Subtrack: $500 prize

import type { Address, Hash } from 'viem'

export interface GaslessTransferParams {
  from: Address
  to: Address
  amountUSDC: number
}

/**
 * Build a ZeroDev Kernel smart account client from a Magic wallet signer.
 * This enables gasless transactions — user pays nothing.
 *
 * Replace stubs with real SDK calls once installed.
 */
export async function getZeroDevClient(signerAddress: Address) {
  if (typeof window === 'undefined') return null

  // Real implementation:
  // const { createKernelAccount, createKernelAccountClient } = await import('@zerodev/sdk')
  // const { signerToEcdsaValidator } = await import('@zerodev/ecdsa-validator')
  // const { createPublicClient, http } = await import('viem')
  // const { arbitrum } = await import('viem/chains')
  //
  // const publicClient = createPublicClient({
  //   chain: arbitrum,
  //   transport: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC),
  // })
  //
  // const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  //   signer: magicSigner, // from Magic SDK
  //   kernelVersion: KERNEL_V3_1,
  // })
  //
  // const account = await createKernelAccount(publicClient, {
  //   plugins: { sudo: ecdsaValidator },
  //   kernelVersion: KERNEL_V3_1,
  // })
  //
  // return createKernelAccountClient({
  //   account,
  //   chain: arbitrum,
  //   bundlerTransport: http(`https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`),
  //   paymaster: {
  //     getPaymasterData: paymasterClient.sponsorUserOperation,
  //   },
  // })

  console.log('[ZeroDev] Client stub for address:', signerAddress)
  return null
}

/**
 * Send a gasless USDC transfer via ZeroDev.
 * Gas is sponsored by the ZeroDev paymaster — user pays nothing.
 */
export async function sendGasless(params: GaslessTransferParams): Promise<Hash> {
  const client = await getZeroDevClient(params.from)

  if (!client) {
    // Mock
    await new Promise(r => setTimeout(r, 1500))
    return `0x${Math.random().toString(16).slice(2)}` as Hash
  }

  // Real implementation:
  // const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // USDC on Arbitrum
  // const transferData = encodeFunctionData({
  //   abi: erc20Abi,
  //   functionName: 'transfer',
  //   args: [params.to, BigInt(params.amountUSDC * 1_000_000)], // 6 decimals
  // })
  // return client.sendUserOperation({
  //   callData: await client.account.encodeCalls([{
  //     to: usdcAddress,
  //     data: transferData,
  //     value: 0n,
  //   }]),
  // })

  return '0x' as Hash
}
