import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sets = await db.hashtagSet.findMany({
      orderBy: { usageCount: 'desc' },
    })
    const parsed = sets.map((s) => ({
      ...s,
      hashtags: JSON.parse(s.hashtags),
    }))
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hashtag sets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const set = await db.hashtagSet.create({
      data: {
        name: body.name,
        hashtags: JSON.stringify(body.hashtags),
        category: body.category,
        usageCount: 0,
      },
    })
    return NextResponse.json({ ...set, hashtags: body.hashtags })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create hashtag set' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.hashtagSet.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete hashtag set' }, { status: 500 })
  }
}
