import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import type { Difficulty } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates = await req.json() as Record<string, unknown>

  if (typeof updates.difficulty_level === 'number') {
    const lvl = updates.difficulty_level
    updates.difficulty = (lvl <= 3 ? 'easy' : lvl <= 7 ? 'medium' : 'hard') as Difficulty
    updates.xp_reward = lvl <= 3 ? 10 : lvl <= 7 ? 20 : 30
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card: data })
}
