import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/seller/documents/[id]/file - Download document file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    // Seller can only view own documents, admin can view all
    const where = session.role === 'ADMIN' ? { id } : { id, userId: session.id }
    const doc = await db.sellerDocument.findFirst({
      where,
      select: { id: true, userId: true, fileData: true, mimeType: true, fileName: true },
    })

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan' }, { status: 404 })
    }

    const buffer = Buffer.from(doc.fileData, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${doc.fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Get document file error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat file' }, { status: 500 })
  }
}
