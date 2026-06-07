import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * DELETE /api/social/meta/disconnect?accountId=xxx
 * Disconnects a social account (marks as disconnected, keeps for history)
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('accountId')

  if (!accountId) {
    return NextResponse.json({ error: 'accountId es requerido' }, { status: 400 })
  }

  try {
    await db.socialAccount.update({
      where: { id: accountId },
      data: { isConnected: false },
    })

    return NextResponse.json({ success: true, message: 'Cuenta desconectada correctamente' })
  } catch (err) {
    console.error('Disconnect error:', err)
    return NextResponse.json({ error: 'Error al desconectar la cuenta' }, { status: 500 })
  }
}
