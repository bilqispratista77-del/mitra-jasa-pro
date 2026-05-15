import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/documents - List all documents (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const userId = searchParams.get('userId') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (userId) where.userId = userId

    const documents = await db.sellerDocument.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      select: {
        id: true,
        type: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        status: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    console.error('Get admin documents error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat dokumen' }, { status: 500 })
  }
}

// PUT /api/admin/documents - Review document (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, note } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID dan status wajib diisi' }, { status: 400 })
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400 })
    }

    const doc = await db.sellerDocument.findUnique({ where: { id } })
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan' }, { status: 404 })
    }

    const updated = await db.sellerDocument.update({
      where: { id },
      data: {
        status,
        note: note || '',
        ...(status === 'APPROVED' ? {} : {}),
      },
    })

    // If approved, check if all required docs are approved → auto verify seller
    if (status === 'APPROVED') {
      const pendingDocs = await db.sellerDocument.count({
        where: { userId: doc.userId, status: 'PENDING' },
      })
      const totalDocs = await db.sellerDocument.count({
        where: { userId: doc.userId, status: 'APPROVED' },
      })

      if (pendingDocs === 0 && totalDocs > 0) {
        await db.user.update({
          where: { id: doc.userId },
          data: { verified: true },
        })
      }
    }

    // If rejected, unverify seller if all approved docs are gone
    if (status === 'REJECTED') {
      const approvedDocs = await db.sellerDocument.count({
        where: { userId: doc.userId, status: 'APPROVED' },
      })
      if (approvedDocs === 0) {
        await db.user.update({
          where: { id: doc.userId },
          data: { verified: false },
        })
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Review document error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate dokumen' }, { status: 500 })
  }
}
