// Magic SDK — embedded wallet + social login
// Docs: https://docs.magic.link/embedded-wallets/
import type { Magic as MagicInstance } from 'magic-sdk'

let magicInstance: MagicInstance | null = null

export async function getMagic(): Promise<MagicInstance | null> {
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

  return magicInstance
}

export async function loginWithEmail(email: string) {
  const magic = await getMagic()
  if (!magic) throw new Error('Magic not available')
  await magic.auth.loginWithEmailOTP({ email })
  const metadata = await magic.user.getMetadata()
  return metadata
}

// The typed `oauth` surface only exists once the OAuth extension is registered
// on the Magic instance. To enable Google login for real:
//   1. npm i @magic-ext/oauth
//   2. new Magic(key, { extensions: [new OAuthExtension()], network: {...} })
// Until then this is a stub — the assertion documents the expected shape.
type OAuthLogin = {
  loginWithRedirect(opts: { provider: string; redirectURI: string }): Promise<void>
}

export async function loginWithGoogle() {
  const magic = await getMagic()
  if (!magic) throw new Error('Magic not available')
  // OAuth redirect flow — configure in Magic dashboard
  await (magic.oauth as unknown as OAuthLogin).loginWithRedirect({
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
