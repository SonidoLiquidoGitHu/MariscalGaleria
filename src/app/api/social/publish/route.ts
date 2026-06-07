import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/social/publish
 * Publishes content to Facebook and/or Instagram
 *
 * Body: {
 *   platform: 'facebook' | 'instagram' | 'both',
 *   caption: string,
 *   mediaUrls: string[],   // Image URLs (must be publicly accessible)
 *   pageId?: string,       // FB Page ID (auto-selected if not provided)
 *   igBusinessId?: string, // IG Business ID (auto-selected if not provided)
 *   scheduledPostId?: string, // Link to scheduled post
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { platform, caption, mediaUrls = [], pageId, igBusinessId, scheduledPostId } = body

    if (!caption) {
      return NextResponse.json({ error: 'El caption es requerido' }, { status: 400 })
    }

    const results: { platform: string; success: boolean; postId?: string; error?: string }[] = []

    // ── Publish to Facebook Page ──
    if (platform === 'facebook' || platform === 'both') {
      try {
        // Find the Facebook Page account
        const fbAccount = pageId
          ? await db.socialAccount.findFirst({ where: { platform: 'facebook', pageId, isConnected: true } })
          : await db.socialAccount.findFirst({ where: { platform: 'facebook', pageId: { not: null }, isConnected: true } })

        if (!fbAccount) {
          results.push({ platform: 'facebook', success: false, error: 'No hay página de Facebook conectada' })
        } else {
          const fbPostData: Record<string, string> = {
            message: caption,
            access_token: fbAccount.accessToken,
          }

          // If there are images, use the photos endpoint
          if (mediaUrls.length === 1) {
            fbPostData.url = mediaUrls[0]
            const res = await fetch(
              `https://graph.facebook.com/v21.0/${fbAccount.pageId}/photos`,
              { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fbPostData) }
            )
            const data = await res.json()
            if (data.id) {
              results.push({ platform: 'facebook', success: true, postId: data.id })
            } else {
              results.push({ platform: 'facebook', success: false, error: data.error?.message || 'Error desconocido' })
            }
          } else if (mediaUrls.length > 1) {
            // Multi-image post: upload each photo first, then create a multi-post
            const photoIds: string[] = []
            for (const url of mediaUrls) {
              const uploadRes = await fetch(
                `https://graph.facebook.com/v21.0/${fbAccount.pageId}/photos?` +
                `url=${encodeURIComponent(url)}&published=false&access_token=${fbAccount.accessToken}`,
                { method: 'POST' }
              )
              const uploadData = await uploadRes.json()
              if (uploadData.id) photoIds.push(uploadData.id)
            }

            if (photoIds.length > 0) {
              const multiPostData: Record<string, string> = {
                message: caption,
                access_token: fbAccount.accessToken,
              }
              photoIds.forEach((id, i) => {
                multiPostData[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })
              })

              const res = await fetch(
                `https://graph.facebook.com/v21.0/${fbAccount.pageId}/feed`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(multiPostData) }
              )
              const data = await res.json()
              if (data.id) {
                results.push({ platform: 'facebook', success: true, postId: data.id })
              } else {
                results.push({ platform: 'facebook', success: false, error: data.error?.message || 'Error al publicar' })
              }
            }
          } else {
            // Text-only post
            const res = await fetch(
              `https://graph.facebook.com/v21.0/${fbAccount.pageId}/feed`,
              { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fbPostData) }
            )
            const data = await res.json()
            if (data.id) {
              results.push({ platform: 'facebook', success: true, postId: data.id })
            } else {
              results.push({ platform: 'facebook', success: false, error: data.error?.message || 'Error al publicar' })
            }
          }

          // Update lastUsedAt
          await db.socialAccount.update({ where: { id: fbAccount.id }, data: { lastUsedAt: new Date() } })
        }
      } catch (fbErr: any) {
        results.push({ platform: 'facebook', success: false, error: fbErr.message || 'Error de conexión' })
      }
    }

    // ── Publish to Instagram ──
    if (platform === 'instagram' || platform === 'both') {
      try {
        // Find the Instagram Business account
        const igAccount = igBusinessId
          ? await db.socialAccount.findFirst({ where: { platform: 'instagram', igBusinessId, isConnected: true } })
          : await db.socialAccount.findFirst({ where: { platform: 'instagram', igBusinessId: { not: null }, isConnected: true } })

        if (!igAccount) {
          results.push({ platform: 'instagram', success: false, error: 'No hay cuenta de Instagram Business conectada' })
        } else if (!mediaUrls || mediaUrls.length === 0) {
          results.push({ platform: 'instagram', success: false, error: 'Instagram requiere al menos una imagen' })
        } else {
          // Instagram Content Publishing API
          // Step 1: Create a media container
          const containerData: Record<string, string> = {
            caption,
            access_token: igAccount.accessToken,
          }

          if (mediaUrls.length === 1) {
            containerData.image_url = mediaUrls[0]
          } else {
            // Carousel post
            containerData.media_type = 'CAROUSEL'
            mediaUrls.forEach((url: string, i: number) => {
              containerData[`children[${i}][image_url]`] = url
            })
          }

          const containerRes = await fetch(
            `https://graph.facebook.com/v21.0/${igAccount.igBusinessId}/media`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(containerData) }
          )
          const containerJson = await containerRes.json()

          if (!containerJson.id) {
            results.push({ platform: 'instagram', success: false, error: containerJson.error?.message || 'Error al crear contenedor' })
          } else {
            // Step 2: Wait a moment for processing, then publish
            await new Promise((resolve) => setTimeout(resolve, 3000))

            const publishData = {
              creation_id: containerJson.id,
              access_token: igAccount.accessToken,
            }

            const publishRes = await fetch(
              `https://graph.facebook.com/v21.0/${igAccount.igBusinessId}/media_publish`,
              { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(publishData) }
            )
            const publishJson = await publishRes.json()

            if (publishJson.id) {
              results.push({ platform: 'instagram', success: true, postId: publishJson.id })
            } else {
              results.push({ platform: 'instagram', success: false, error: publishJson.error?.message || 'Error al publicar' })
            }
          }

          // Update lastUsedAt
          await db.socialAccount.update({ where: { id: igAccount.id }, data: { lastUsedAt: new Date() } })
        }
      } catch (igErr: any) {
        results.push({ platform: 'instagram', success: false, error: igErr.message || 'Error de conexión' })
      }
    }

    // Update scheduled post status if linked
    if (scheduledPostId) {
      const allSuccess = results.every((r) => r.success)
      await db.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: allSuccess ? 'published' : 'failed',
          publishedAt: allSuccess ? new Date() : undefined,
        },
      })
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
