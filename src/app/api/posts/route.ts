import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const posts = await db.scheduledPost.findMany({
      orderBy: { scheduledAt: 'asc' },
    })
    const parsed = posts.map((p) => ({
      ...p,
      media: p.media ? JSON.parse(p.media) : [],
      hashtags: p.hashtags ? JSON.parse(p.hashtags) : [],
    }))
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const post = await db.scheduledPost.create({
      data: {
        caption: body.caption,
        platform: body.platform || 'instagram',
        media: body.media ? JSON.stringify(body.media) : null,
        scheduledAt: new Date(body.scheduledAt),
        status: body.status || 'scheduled',
        isRecurring: body.isRecurring || false,
        recurrence: body.recurrence,
        hashtags: body.hashtags ? JSON.stringify(body.hashtags) : null,
        productId: body.productId,
      },
    })
    return NextResponse.json({
      ...post,
      media: body.media || [],
      hashtags: body.hashtags || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.scheduledPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
