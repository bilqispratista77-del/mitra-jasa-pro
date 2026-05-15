import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        subCategories: {
          include: {
            _count: {
              select: {
                services: {
                  where: {
                    approved: true,
                  },
                },
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            services: {
              where: {
                approved: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const formatted = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      serviceCount: category._count.services,
      subCategories: category.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        categoryId: sub.categoryId,
        serviceCount: sub._count.services,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
