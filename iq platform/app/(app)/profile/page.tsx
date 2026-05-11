import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import XPBar from '@/components/gamification/XPBar'
import StreakBadge from '@/components/gamification/StreakBadge'
import BadgeGrid from '@/components/gamification/BadgeGrid'
import { PILLAR_LABELS, type Pillar } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: progress }, { data: badges }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('progress').select('*').eq('user_id', user.id),
    supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id),
  ])

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile?.username}</h1>
          <p className="text-gray-400 text-sm">{profile?.xp_total} XP סה&quot;כ</p>
        </div>
      </div>

      <StreakBadge streak={profile?.streak ?? 0} />

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">התקדמות לפי עמודה</h2>
        {(progress ?? []).map(p => (
          <div key={p.pillar} className="bg-white rounded-xl p-3 border">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{PILLAR_LABELS[p.pillar as Pillar]}</span>
              <span className="text-sm text-gray-400">{p.cards_completed} כרטיסים</span>
            </div>
            <XPBar xp={p.xp} level={p.level} />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">תגים</h2>
        <BadgeGrid badges={badges ?? []} />
      </div>

      <form action="/api/auth/logout" method="POST">
        <button className="text-sm text-gray-400 hover:text-red-500 transition-colors">התנתק</button>
      </form>
    </div>
  )
}
