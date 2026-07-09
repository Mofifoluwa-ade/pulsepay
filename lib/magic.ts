import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth2';

const createMagic = () => {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_MAGIC_KEY || process.env.MAGIC_PUBLISHABLE_KEY;

  // Detect missing or placeholder/mock keys and run in mock mode
  if (!key || key === 'pk_live_mock_key' || key.includes('...') || key.includes('your_')) {
    console.log('Running in Mock Magic Auth mode due to missing or placeholder API key.');
    return null;
  }

  const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';

  try {
    return new Magic(key, {
      network: {
        rpcUrl,
        chainId: 421614, // Arbitrum Sepolia Testnet
      },
      extensions: [new OAuthExtension()],
    });
  } catch (e) {
    console.error('Failed to initialize Magic SDK:', e);
    return null;
  }
};

export const magic = createMagic();
