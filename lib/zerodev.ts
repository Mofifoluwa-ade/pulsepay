const projectId = process.env.ZERODEV_PROJECT_ID || '';
const isMockMode = !projectId || projectId.includes('your_');

export async function getZeroDevClient(signerAddress: string) {
  if (isMockMode) {
    // Return a mock ZeroDev client that handles sponsored transactions
    return {
      sendUserOperation: async (params: { userOperation: any }) => {
        // Simulate block execution delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Return a mock transaction hash
        return '0x' + Math.random().toString(16).substring(2, 42) + 'd1b2';
      },
    };
  }

  try {
    // Standard bundler connection using ZeroDev RPC URL
    return {
      sendUserOperation: async (params: { userOperation: any }) => {
        const rpcUrl = `https://bundler.zerodev.app/api/v3/bundler/${projectId}`;
        const res = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendUserOperation',
            params: [params.userOperation, '0x66eee'], // Arbitrum Sepolia chain ID (421614)
          }),
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error.message || 'ZeroDev Bundler Error');
        }
        return data.result;
      },
    };
  } catch (error) {
    console.error('Error creating real ZeroDev client, falling back to mock:', error);
    return {
      sendUserOperation: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return '0x' + Math.random().toString(16).substring(2, 42) + 'f8c0';
      },
    };
  }
}
