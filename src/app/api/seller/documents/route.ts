import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// GET /api/seller/documents - List seller's own documents
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const documents = await db.sellerDocument.findMany({
      where: { userId: session.id },
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
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    console.error('Get seller documents error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat dokumen' }, { status: 500 })
  }
}

// POST /api/seller/documents - Upload a document
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    if (session.role !== 'SELLER') {
      return NextResponse.json({ success: false, error: 'Hanya seller yang dapat upload dokumen' }, { status: 403 })
    }

    const body = await request.json()
    const { type, fileName, mimeType, fileData, fileSize } = body

    if (!type || !fileData) {
      return NextResponse.json({ success: false, error: 'Tipe dan file wajib diisi' }, { status: 400 })
    }

    const validTypes = ['KTP', 'SIUP', 'SERTIFIKAT', 'PORTOFOLIO', 'LAINNYA']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'Tipe dokumen tidak valid' }, { status: 400 })
    }

    // Check file size (base64 is ~33% larger than binary)
    const estimatedBytes = Math.ceil((fileData.length * 3) / 4)
    if (estimatedBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      )
    }

    // Check if document of this type already exists and is PENDING or APPROVED
    const existing = await db.sellerDocument.findFirst({
      where: { userId: session.id, type, status: { in: ['PENDING', 'APPROVED'] } },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Dokumen ${type} sudah ada dan belum ditolak. Hapus atau tunggu review.` },
        { status: 409 }
      )
    }

    const document = await db.sellerDocument.create({
      data: {
        userId: session.id,
        type,
        fileName: fileName || `${type}_${Date.now()}`,
        mimeType: mimeType || 'application/octet-stream',
        fileData,
        fileSize: fileSize || estimatedBytes,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
      },
    })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengupload dokumen' }, { status: 500 })
  }
}

// DELETE /api/seller/documents - Delete own document (only REJECTED or PENDING)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')

    if (!docId) {
      return NextResponse.json({ success: false, error: 'ID dokumen wajib' }, { status: 400 })
    }

    const doc = await db.sellerDocument.findFirst({
      where: { id: docId, userId: session.id },
    })

    if (!doc) {
      return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan' }, { status: 404 })
    }

    if (doc.status === 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Dokumen yang sudah disetujui tidak dapat dihapus' }, { status: 400 })
    }

    await db.sellerDocument.delete({ where: { id: docId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus dokumen' }, { status: 500 })
  }
}
