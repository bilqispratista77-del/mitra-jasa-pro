import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/articles - Get all articles (admin only)
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const articles = await db.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: articles,
    })
  } catch (error) {
    console.error('Get admin articles error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/articles - Create article (admin only)
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
    const { title, slug, excerpt, content, imageUrl, category, author, authorAvatar, readTime } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: 'Judul, slug, dan konten wajib diisi' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.article.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug sudah digunakan, gunakan slug lain' },
        { status: 409 }
      )
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        imageUrl: imageUrl || '',
        category: category || '',
        author: author || '',
        authorAvatar: authorAvatar || '',
        readTime: readTime || 5,
      },
    })

    return NextResponse.json({
      success: true,
      data: article,
    })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
