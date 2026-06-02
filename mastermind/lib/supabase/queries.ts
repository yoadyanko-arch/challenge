import type { Card, User, Progress, Pillar } from '@/types'

export async function getApprovedCards(supabase: any, pillar?: Pillar, topic?: string, limit = 20) {
  let query = supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (pillar) query = query.eq('pillar', pillar)
  if (topic) query = query.eq('topic', topic)
  const { data, error } = await query
  if (error) throw error
  return data as Card[]
}

export async function getUserWithProgress(supabase: any, userId: string) {
  const [{ data: user }, { data: progress }] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('progress').select('*').eq('user_id', userId),
  ])
  return { user: user as User, progress: progress as Progress[] }
}

export async function getPendingCards(supabase: any) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Card[]
}

export async function updateCardStatus(supabase: any, cardId: string, status: 'approved' | 'rejected') {
  const { error } = await supabase
    .from('cards')
    .update({ status })
    .eq('id', cardId)
  if (error) throw error
}

export async function getLeaderboard(supabase: any, limit = 20) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, xp_total, streak')
    .order('xp_total', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Pick<User, 'id' | 'username' | 'avatar_url' | 'xp_total' | 'streak'>[]
}
