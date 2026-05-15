import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PUT /api/admin/users/[id] - Update seller status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Prevent admin from updating themselves
    if (id === session.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot update your own account' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { active, verified, membershipPlan, membershipExpiresAt } = body

    if (active === undefined && verified === undefined && !membershipPlan && membershipExpiresAt === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least one field is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, any> = {}
    if (active !== undefined) updateData.active = active
    if (verified !== undefined) updateData.verified = verified
    if (membershipPlan) updateData.membershipPlan = membershipPlan
    if (membershipExpiresAt !== undefined) {
      updateData.membershipExpiresAt = membershipExpiresAt ? new Date(membershipExpiresAt) : null
    }

    // If upgrading to BASIC or PRO and no expiry set, default to 1 year from now
    if (membershipPlan && membershipPlan !== 'FREE' && !membershipExpiresAt) {
      const existingExpiry = user.membershipExpiresAt
      if (!existingExpiry || new Date(existingExpiry) < new Date()) {
        const expiry = new Date()
        expiry.setFullYear(expiry.getFullYear() + 1)
        updateData.membershipExpiresAt = expiry
      }
    }

    // If downgrading to FREE, clear the expiry
    if (membershipPlan === 'FREE') {
      updateData.membershipExpiresAt = null
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatar: true,
        role: true,
        verified: true,
        active: true,
        membershipPlan: true,
        membershipExpiresAt: true,
        createdAt: true,
        _count: {
          select: { services: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === session.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user's services first (cascade)
    await db.service.deleteMany({
      where: { sellerId: id },
    })

    // Delete the user
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'User deleted successfully' },
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
