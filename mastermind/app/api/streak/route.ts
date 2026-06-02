import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shouldUpdateStreak, isStreakBroken } from '@/lib/streak'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('streak, last_active')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  let newStreak = profile.streak
  const broken = isStreakBroken(profile.last_active)
  const shouldInc = shouldUpdateStreak(profile.last_active)

  if (broken) newStreak = 1
  else if (shouldInc) newStreak = profile.streak + 1

  await supabase.from('users')
    .update({ streak: newStreak, last_active: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ streak: newStreak })
}
