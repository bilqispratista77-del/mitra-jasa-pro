import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PUT /api/admin/banners/[id] - Update banner (admin only)
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
    const { title, subtitle, description, ctaText, ctaLink, imageUrl, order, active } = body

    const banner = await db.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: Record<string, string | number | boolean> = {}
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (ctaText !== undefined) updateData.ctaText = ctaText
    if (ctaLink !== undefined) updateData.ctaLink = ctaLink
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (typeof order === 'number') updateData.order = order
    if (typeof active === 'boolean') updateData.active = active

    const updated = await db.banner.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update banner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/banners/[id] - Delete banner (admin only)
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

    const banner = await db.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Banner berhasil dihapus' },
    })
  } catch (error) {
    console.error('Delete banner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
