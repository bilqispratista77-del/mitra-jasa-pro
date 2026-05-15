import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PUT /api/admin/sponsors/[id] - Update sponsor (admin only)
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
    const body = await request.json()
    const { name, logoUrl, order, active } = body

    const sponsor = await db.sponsor.findUnique({
      where: { id },
    })

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: 'Sponsor tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, string | number | boolean> = {}
    if (name !== undefined) updateData.name = name
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (typeof order === 'number') updateData.order = order
    if (typeof active === 'boolean') updateData.active = active

    const updated = await db.sponsor.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update sponsor error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sponsors/[id] - Delete sponsor (admin only)
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

    const sponsor = await db.sponsor.findUnique({
      where: { id },
    })

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: 'Sponsor tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.sponsor.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Sponsor berhasil dihapus' },
    })
  } catch (error) {
    console.error('Delete sponsor error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
