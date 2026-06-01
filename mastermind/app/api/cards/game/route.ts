import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const pillar = url.searchParams.get('pillar')
  const topic = url.searchParams.get('topic') || null

  let query = supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .limit(15)

  if (pillar && pillar !== 'mix') query = query.eq('pillar', pillar)
  if (topic) query = query.eq('topic', topic)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5)
  return NextResponse.json({ cards: shuffled })
}
