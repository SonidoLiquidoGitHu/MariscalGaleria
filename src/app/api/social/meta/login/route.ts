import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/social/meta/login
 * Initiates the Meta OAuth flow — redirects user to Facebook login
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform') || 'facebook'

  const appId = process.env.META_APP_ID

  if (!appId) {
    return NextResponse.json(
      { error: 'META_APP_ID no configurado. Ve a Admin → Redes Sociales para configurar tu App de Meta.' },
      { status: 400 }
    )
  }

  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  const redirectUri = `${protocol}://${host}/api/social/meta/callback`

  const state = Buffer.from(JSON.stringify({
    platform,
    redirect: searchParams.get('redirect') || '/admin',
    timestamp: Date.now(),
  })).toString('base64url')

  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_engagement',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
  ].join(',')

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
