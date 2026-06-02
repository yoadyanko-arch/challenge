import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('friends')
    .select('friend_id, status, users!friends_friend_id_fkey(username, xp_total, streak)')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await req.json()
  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (!target) return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 404 })
  if (target.id === user.id) return NextResponse.json({ error: 'לא ניתן להוסיף את עצמך' }, { status: 400 })

  await supabase.from('friends').upsert({
    user_id: user.id,
    friend_id: target.id,
    status: 'accepted',
  })

  return NextResponse.json({ ok: true })
}
