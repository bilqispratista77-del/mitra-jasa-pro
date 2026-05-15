import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// DELETE /api/admin/articles/[id] - Delete article (admin only)
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

    const article = await db.article.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.article.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Artikel berhasil dihapus' },
    })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
