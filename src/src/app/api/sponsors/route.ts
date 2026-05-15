import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/sponsors - Get active sponsors (public)
export async function GET() {
  try {
    const sponsors = await db.sponsor.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        order: true,
      },
      orderBy: [{ order: 'asc' }],
    })

    return NextResponse.json({
      success: true,
      data: sponsors,
    })
  } catch (error) {
    console.error('Get sponsors error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
