import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json()

  // Sign up via admin client so we can immediately create the profile
  const service = createServiceClient()

  const { data, error: signUpError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (signUpError || !data.user) {
    return NextResponse.json({ error: signUpError?.message ?? 'שגיאה ביצירת משתמש' }, { status: 400 })
  }

  const userId = data.user.id

  const { error: profileError } = await service.from('users').insert({
    id: userId,
    email,
    username,
  })

  if (profileError) {
    // Clean up the auth user if profile creation fails
    await service.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  await service.from('progress').insert([
    { user_id: userId, pillar: 'think' },
    { user_id: userId, pillar: 'people' },
    { user_id: userId, pillar: 'business' },
    { user_id: userId, pillar: 'self' },
  ])

  return NextResponse.json({ ok: true })
}
