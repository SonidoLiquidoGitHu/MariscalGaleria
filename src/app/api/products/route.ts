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
    return NextResponse.json({ products: parsed })
  } catch (error) {
    console.error('GET products error:', error)
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
        category: body.category || 'anillos',
        discipline: body.discipline || 'joyeria',
        sku: body.sku,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        media: body.media ? JSON.stringify(body.media) : null,
        videoUrl: body.videoUrl,
      },
    })
    return NextResponse.json({
      product: {
        ...product,
        media: body.media || [],
      },
    })
  } catch (error) {
    console.error('POST product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Convert media array to JSON string if present
    if (updates.media) {
      updates.media = JSON.stringify(updates.media)
    }

    const product = await db.product.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({
      product: {
        ...product,
        media: product.media ? JSON.parse(product.media) : [],
      },
    })
  } catch (error) {
    console.error('PATCH product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
    console.error('DELETE product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
