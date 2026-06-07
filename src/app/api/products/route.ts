import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    const parsed = products.map((p) => ({
      ...p,
      media: p.media ? JSON.parse(p.media) : [],
    }))
    return NextResponse.json(parsed)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category || 'rings',
        sku: body.sku,
        isFeatured: body.isFeatured || false,
        media: body.media ? JSON.stringify(body.media) : null,
        videoUrl: body.videoUrl,
      },
    })
    return NextResponse.json({ ...product, media: body.media || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
