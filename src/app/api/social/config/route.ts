import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/social/config
 * Returns the current Meta App configuration
 * Checks environment variables first, then falls back to database config
 */
export async function GET() {
  try {
    // Priority 1: Check environment variables
    const envAppId = process.env.META_APP_ID
    const envAppSecret = process.env.META_APP_SECRET

    if (envAppId && envAppSecret) {
      return NextResponse.json({
        configured: true,
        appId: envAppId,
        appSecretSet: true,
        source: 'environment',
      })
    }

    // Priority 2: Check database config
    const config = await db.metaAppConfig.findFirst()
    if (!config) {
      return NextResponse.json({ configured: false })
    }
    return NextResponse.json({
      configured: true,
      appId: config.appId,
      appSecretSet: !!config.appSecret,
      source: 'database',
    })
  } catch {
    return NextResponse.json({ configured: false })
  }
}

/**
 * POST /api/social/config
 * Saves or updates the Meta App configuration (fallback for non-env-var setups)
 * Body: { appId: string, appSecret: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { appId, appSecret } = await req.json()

    if (!appId || !appSecret) {
      return NextResponse.json({ error: 'App ID y App Secret son requeridos' }, { status: 400 })
    }

    const existing = await db.metaAppConfig.findFirst()

    if (existing) {
      await db.metaAppConfig.update({
        where: { id: existing.id },
        data: { appId, appSecret },
      })
    } else {
      await db.metaAppConfig.create({
        data: { appId, appSecret },
      })
    }

    return NextResponse.json({ success: true, message: 'Configuración guardada correctamente' })
  } catch (err: any) {
    console.error('Config save error:', err)
    return NextResponse.json({ error: 'Error al guardar la configuración' }, { status: 500 })
  }
}
