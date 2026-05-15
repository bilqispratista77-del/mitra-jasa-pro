import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// GET /api/services - List services with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const subCategory = searchParams.get('subCategory') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const featured = searchParams.get('featured')

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
      approved: true,
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (subCategory) {
      where.subCategory = {
        slug: subCategory,
      }
    }

    if (location) {
      where.location = { contains: location }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        (where.price as Prisma.FloatFilter)['gte'] = parseFloat(minPrice)
      }
      if (maxPrice) {
        (where.price as Prisma.FloatFilter)['lte'] = parseFloat(maxPrice)
      }
    }

    // Build order by
    let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'price_low':
        orderBy = { price: 'asc' }
        break
      case 'price_high':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const skip = (page - 1) * limit

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.service.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, price, imageUrl, location, whatsapp, categoryId, subCategoryId } =
      body

    // Validate required fields
    if (!title || !description || !price || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, description, price, and categoryId are required',
        },
        { status: 400 }
      )
    }

    // Check membership plan limits
    const seller = await db.user.findUnique({
      where: { id: session.id },
      select: { membershipPlan: true, membershipExpiresAt: true },
    })

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine effective plan (check expiry)
    let effectivePlan = seller.membershipPlan
    if (effectivePlan !== 'FREE' && seller.membershipExpiresAt) {
      if (new Date(seller.membershipExpiresAt) < new Date()) {
        // Membership expired, reset to FREE
        await db.user.update({
          where: { id: session.id },
          data: { membershipPlan: 'FREE', membershipExpiresAt: null },
        })
        effectivePlan = 'FREE'
      }
    }

    const planLimits: Record<string, number> = { FREE: 2, BASIC: 5, PRO: 10 }
    const maxPostings = planLimits[effectivePlan] || 2

    const currentCount = await db.service.count({
      where: { sellerId: session.id },
    })

    if (currentCount >= maxPostings) {
      return NextResponse.json(
        {
          success: false,
          error: `Batas postingan akun ${effectivePlan} Anda (${maxPostings} jasa) sudah tercapai. Silakan upgrade ke paket yang lebih tinggi.`,
          code: 'MEMBERSHIP_LIMIT',
          currentCount,
          maxPostings,
          membershipPlan: effectivePlan,
        },
        { status: 403 }
      )
    }

    // Verify category exists
    const categoryExists = await db.category.findUnique({
      where: { id: categoryId },
    })

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify sub-category exists if provided
    if (subCategoryId) {
      const subCategoryExists = await db.subCategory.findUnique({
        where: { id: subCategoryId },
      })

      if (!subCategoryExists) {
        return NextResponse.json(
          { success: false, error: 'Sub-category not found' },
          { status: 404 }
        )
      }
    }

    const service = await db.service.create({
      data: {
        title,
        description,
        price: parseFloat(String(price)),
        imageUrl: imageUrl || '',
        location: location || '',
        whatsapp: whatsapp || '',
        categoryId,
        subCategoryId: subCategoryId || null,
        sellerId: session.id,
        approved: true,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
