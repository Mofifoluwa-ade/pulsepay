import { createPublicClient, http, Address } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(rpcUrl),
});

const USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';

const erc20Abi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
  }
] as const;

export async function getRealUSDCBalance(address: string): Promise<number | null> {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return null;
  }
  
  try {
    const rawBalance = await client.readContract({
      address: USDC_ADDRESS as Address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as Address],
    } as any);
    
    const decimals = await client.readContract({
      address: USDC_ADDRESS as Address,
      abi: erc20Abi,
      functionName: 'decimals',
    } as any);

    const formattedBalance = Number(rawBalance) / Math.pow(10, Number(decimals));
    return formattedBalance;
  } catch (error) {
    console.warn(`Failed to fetch on-chain USDC balance for ${address}:`, error);
    return null;
  }
}
