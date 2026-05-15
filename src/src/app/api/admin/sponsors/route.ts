import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/sponsors - Get all sponsors (admin only)
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

    const sponsors = await db.sponsor.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      data: sponsors,
    })
  } catch (error) {
    console.error('Get admin sponsors error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/sponsors - Create sponsor (admin only)
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
    const { name, logoUrl, order, active } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama sponsor wajib diisi' },
        { status: 400 }
      )
    }

    const sponsor = await db.sponsor.create({
      data: {
        name,
        logoUrl: logoUrl || '',
        order: typeof order === 'number' ? order : 0,
        active: typeof active === 'boolean' ? active : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: sponsor,
    })
  } catch (error) {
    console.error('Create sponsor error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
