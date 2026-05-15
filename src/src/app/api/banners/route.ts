import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners - Get active banners (public)
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }],
    })

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error('Get banners error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
