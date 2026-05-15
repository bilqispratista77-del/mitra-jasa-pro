import { hash, compare } from 'bcryptjs'

export const SESSION_COOKIE_NAME = 'mitrajasapro-session'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  membershipPlan?: string
  membershipExpiresAt?: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash)
}

export function createSessionToken(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64')
}

export function getSession(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  const sessionCookie = cookies.find((c) =>
    c.startsWith(`${SESSION_COOKIE_NAME}=`)
  )
  if (!sessionCookie) return null

  const rawToken = sessionCookie.split('=').slice(1).join('=')
  if (!rawToken) return null

  try {
    // URL-decode the token (browsers may encode = as %3D)
    const token = decodeURIComponent(rawToken)
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const user = JSON.parse(decoded) as SessionUser
    return user
  } catch {
    return null
  }
}
