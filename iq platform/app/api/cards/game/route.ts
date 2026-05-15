import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Pillar } from '@/types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const pillar = url.searchParams.get('pillar') as Pillar | null
  const topic = url.searchParams.get('topic') || null

  let query = supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .order('difficulty_level', { ascending: true })
    .limit(15)

  if (pillar && pillar !== 'mix') query = query.eq('pillar', pillar)
  if (topic) query = query.eq('topic', topic)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ cards: data ?? [] })
}
