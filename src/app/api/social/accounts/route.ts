import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/social/accounts
 * Returns all connected social accounts
 */
export async function GET() {
  try {
    const accounts = await db.socialAccount.findMany({
      where: { isConnected: true },
      orderBy: { createdAt: 'desc' },
    })

    // Don't expose full access tokens in the response
    const safe = accounts.map((a) => ({
      id: a.id,
      platform: a.platform,
      accountId: a.accountId,
      accountName: a.accountName,
      accountPicture: a.accountPicture,
      pageId: a.pageId,
      igBusinessId: a.igBusinessId,
      isConnected: a.isConnected,
      tokenExpiresAt: a.tokenExpiresAt,
      lastUsedAt: a.lastUsedAt,
      createdAt: a.createdAt,
      hasToken: !!a.accessToken,
    }))

    return NextResponse.json({ accounts: safe })
  } catch (err) {
    console.error('Fetch accounts error:', err)
    return NextResponse.json({ accounts: [] })
  }
}
