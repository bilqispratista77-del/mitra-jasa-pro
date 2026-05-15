import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/admin/services - Get all services including unapproved (admin only)
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

    const services = await db.service.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: services,
    })
  } catch (error) {
    console.error('Get admin services error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/services - Toggle service approval status
export async function PATCH(request: NextRequest) {
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
    const { serviceId, approved, featured } = body

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'serviceId is required',
        },
        { status: 400 }
      )
    }

    if (approved === undefined && featured === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one of approved or featured must be provided',
        },
        { status: 400 }
      )
    }

    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, boolean> = {}
    if (approved !== undefined) {
      updateData.approved = Boolean(approved)
    }
    if (featured !== undefined) {
      updateData.featured = Boolean(featured)
    }

    const updatedService = await db.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
      data: {
        id: updatedService.id,
        approved: updatedService.approved,
        featured: updatedService.featured,
      },
    })
  } catch (error) {
    console.error('Toggle service approval/featured error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/services?serviceId=xxx - Delete a service (admin only)
export async function DELETE(request: NextRequest) {
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
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'serviceId query parameter is required' },
        { status: 400 }
      )
    }

    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    await db.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Service deleted' },
    })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
