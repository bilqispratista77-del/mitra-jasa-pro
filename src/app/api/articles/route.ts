import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6', 10)
    const category = searchParams.get('category') || ''

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: articles,
    })
  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
