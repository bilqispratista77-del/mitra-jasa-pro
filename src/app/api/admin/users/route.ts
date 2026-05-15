import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/users - Get all users (admin only)
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

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        whatsapp: true,
        address: true,
        avatar: true,
        role: true,
        active: true,
        verified: true,
        membershipPlan: true,
        membershipExpiresAt: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      whatsapp: user.whatsapp,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      active: user.active,
      verified: user.verified,
      membershipPlan: user.membershipPlan,
      membershipExpiresAt: user.membershipExpiresAt,
      createdAt: user.createdAt,
      serviceCount: user._count.services,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
