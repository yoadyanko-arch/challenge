const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'yoadyanko@gmail.com'

export function isAdmin(email?: string | null): boolean {
  return !!email && email === ADMIN_EMAIL
}
