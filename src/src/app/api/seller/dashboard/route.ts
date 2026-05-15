import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch seller stats
    const [totalServices, activeServices, featuredServices, aggregateStats] = await Promise.all([
      db.service.count({
        where: { sellerId: session.id },
      }),
      db.service.count({
        where: { sellerId: session.id, approved: true },
      }),
      db.service.count({
        where: { sellerId: session.id, featured: true, approved: true },
      }),
      db.service.aggregate({
        where: { sellerId: session.id },
        _avg: { rating: true },
        _sum: { reviewCount: true },
      }),
    ]);

    // Fetch seller's services
    const services = await db.service.findMany({
      where: { sellerId: session.id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subCategory: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch seller profile
    const seller = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalServices,
          activeServices,
          featuredServices,
          averageRating: aggregateStats._avg.rating ? Math.round(aggregateStats._avg.rating * 10) / 10 : 0,
          totalReviews: aggregateStats._sum.reviewCount || 0,
        },
        services,
        seller,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
