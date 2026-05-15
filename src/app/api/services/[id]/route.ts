import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/services/[id] - Get a single service
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await db.service.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            whatsapp: true,
            phone: true,
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

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - Update a service
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

    const { id } = await params

    // Check if service exists and user is the owner
    const existingService = await db.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.sellerId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own services' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, price, imageUrl, location, whatsapp, categoryId, subCategoryId } =
      body

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({
        where: { id: categoryId },
      })
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    const service = await db.service.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(String(price)) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(location !== undefined && { location }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(categoryId !== undefined && { categoryId }),
        ...(subCategoryId !== undefined && { subCategoryId }),
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

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Delete a service
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

    const { id } = await params

    // Check if service exists and user is the owner
    const existingService = await db.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.sellerId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own services' },
        { status: 403 }
      )
    }

    await db.service.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Service deleted successfully' },
    })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
