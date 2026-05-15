import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal memuat testimoni' },
      { status: 500 }
    );
  }
}
