import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, whatsapp, address, subdistrict, district, province, role } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate role
    const userRole = (role === 'SELLER') ? 'SELLER' : 'USER'

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || '',
        whatsapp: whatsapp || phone || '',
        address: address || '',
        subdistrict: subdistrict || '',
        district: district || '',
        province: province || '',
        role: userRole,
      },
    })

    // Create session token
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      membershipPlan: user.membershipPlan,
      membershipExpiresAt: user.membershipExpiresAt ? user.membershipExpiresAt.toISOString() : null,
    })

    // Build response and set cookie directly on it
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        whatsapp: user.whatsapp,
        address: user.address,
        role: user.role,
        membershipPlan: user.membershipPlan,
        membershipExpiresAt: user.membershipExpiresAt,
      },
    })

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
