import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/social/meta/callback
 * Handles the OAuth callback from Meta/Facebook
 * Exchanges the auth code for tokens, fetches pages & IG accounts, stores everything
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  // User denied access
  if (error) {
    const redirectUrl = new URL('/admin', req.url)
    redirectUrl.searchParams.set('social_error', searchParams.get('error_description') || 'Permiso denegado')
    return NextResponse.redirect(redirectUrl.toString())
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/admin?social_error=Faltan+parametros', req.url).toString())
  }

  // Parse state
  let state: { platform: string; redirect: string; timestamp: number }
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
  } catch {
    return NextResponse.redirect(new URL('/admin?social_error=Estado+invalido', req.url).toString())
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.redirect(new URL('/admin?social_error=App+de+Meta+no+configurada', req.url).toString())
  }

  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  const redirectUri = `${protocol}://${host}/api/social/meta/callback`

  try {
    // ── Step 1: Exchange code for short-lived access token ──
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    )
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error)
      return NextResponse.redirect(new URL('/admin?social_error=Error+de+autenticacion', req.url).toString())
    }

    const shortLivedToken = tokenData.access_token

    // ── Step 2: Exchange for long-lived access token ──
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()
    const accessToken = longLivedData.access_token
    const expiresAt = longLivedData.expires_in
      ? new Date(Date.now() + longLivedData.expires_in * 1000)
      : null

    // ── Step 3: Get user info ──
    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=id,name,picture.width(200).height(200)&access_token=${accessToken}`
    )
    const meData = await meRes.json()

    // ── Step 4: Get user's Facebook Pages ──
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,picture.width(200).height(200),access_token&access_token=${accessToken}`
    )
    const pagesData = await pagesRes.json()

    // ── Step 5: For each page, get the linked Instagram Business Account ──
    const pages = pagesData.data || []

    // Store the Facebook user account
    await db.socialAccount.upsert({
      where: {
        platform_accountId: { platform: 'facebook', accountId: meData.id }
      },
      create: {
        platform: 'facebook',
        accountId: meData.id,
        accountName: meData.name,
        accountPicture: meData.picture?.data?.url,
        accessToken,
        tokenExpiresAt: expiresAt,
        isConnected: true,
      },
      update: {
        accountName: meData.name,
        accountPicture: meData.picture?.data?.url,
        accessToken,
        tokenExpiresAt: expiresAt,
        isConnected: true,
      },
    })

    // Store each Facebook Page
    for (const page of pages) {
      let igBusinessId: string | null = null

      // Try to get the IG Business Account linked to this page
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${page.access_token}`
        )
        const igData = await igRes.json()
        if (igData.instagram_business_account) {
          igBusinessId = igData.instagram_business_account.id
          const igUsername = igData.instagram_business_account.username
          const igPicture = igData.instagram_business_account.profile_picture_url

          // Store the Instagram Business Account
          await db.socialAccount.upsert({
            where: {
              platform_accountId: { platform: 'instagram', accountId: igBusinessId }
            },
            create: {
              platform: 'instagram',
              accountId: igBusinessId,
              accountName: igUsername || `@${igBusinessId}`,
              accountPicture: igPicture,
              accessToken: page.access_token,
              tokenExpiresAt: expiresAt,
              pageId: page.id,
              igBusinessId,
              isConnected: true,
            },
            update: {
              accountName: igUsername || `@${igBusinessId}`,
              accountPicture: igPicture,
              accessToken: page.access_token,
              tokenExpiresAt: expiresAt,
              pageId: page.id,
              igBusinessId,
              isConnected: true,
            },
          })
        }
      } catch (igErr) {
        console.warn('Could not fetch IG account for page:', page.id, igErr)
      }

      // Store the Facebook Page
      await db.socialAccount.upsert({
        where: {
          platform_accountId: { platform: 'facebook', accountId: page.id }
        },
        create: {
          platform: 'facebook',
          accountId: page.id,
          accountName: page.name,
          accountPicture: page.picture?.data?.url,
          accessToken: page.access_token, // Page tokens don't expire
          pageId: page.id,
          igBusinessId,
          isConnected: true,
        },
        update: {
          accountName: page.name,
          accountPicture: page.picture?.data?.url,
          accessToken: page.access_token,
          pageId: page.id,
          igBusinessId,
          isConnected: true,
        },
      })
    }

    // Redirect back to admin with success
    const redirectUrl = new URL(state.redirect || '/admin', req.url)
    redirectUrl.searchParams.set('social_success', 'true')
    redirectUrl.searchParams.set('pages_count', String(pages.length))
    return NextResponse.redirect(redirectUrl.toString())

  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL('/admin?social_error=Error+interno+del+servidor', req.url).toString())
  }
}
