import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/banners - Get all banners (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const banners = await db.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error('Get admin banners error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/banners - Create banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, subtitle, description, ctaText, ctaLink, imageUrl, order, active } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Judul banner wajib diisi' },
        { status: 400 }
      )
    }

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || '',
        description: description || '',
        ctaText: ctaText || '',
        ctaLink: ctaLink || '',
        imageUrl: imageUrl || '',
        order: typeof order === 'number' ? order : 0,
        active: typeof active === 'boolean' ? active : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: banner,
    })
  } catch (error) {
    console.error('Create banner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
