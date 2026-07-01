// Magic SDK — embedded wallet + social login
// Docs: https://docs.magic.link/embedded-wallets/

let magicInstance: unknown = null

export async function getMagic() {
  if (typeof window === 'undefined') return null
  if (magicInstance) return magicInstance

  const { Magic } = await import('magic-sdk')

  magicInstance = new Magic(
    process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY ?? 'pk_live_REPLACE_ME',
    {
      network: {
        rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC ?? 'https://arb1.arbitrum.io/rpc',
        chainId: 42161, // Arbitrum One
      },
    }
  )

  return magicInstance as InstanceType<typeof Magic>
}

export async function loginWithEmail(email: string) {
  const magic = await getMagic()
  if (!magic) throw new Error('Magic not available')
  await magic.auth.loginWithEmailOTP({ email })
  const metadata = await magic.user.getMetadata()
  return metadata
}

export async function loginWithGoogle() {
  const magic = await getMagic()
  if (!magic) throw new Error('Magic not available')
  // OAuth redirect flow — configure in Magic dashboard
  await magic.oauth.loginWithRedirect({
    provider: 'google',
    redirectURI: `${window.location.origin}/dashboard`,
  })
}

export async function logout() {
  const magic = await getMagic()
  if (!magic) return
  await magic.user.logout()
}

export async function getWalletAddress(): Promise<string | null> {
  const magic = await getMagic()
  if (!magic) return null
  try {
    const metadata = await magic.user.getMetadata()
    return metadata.publicAddress
  } catch {
    return null
  }
}
