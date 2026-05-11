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
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center text-xl font-bold text-foreground">
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{profile?.username}</h1>
          <p className="text-muted-foreground text-sm">{profile?.xp_total ?? 0} XP סה&quot;כ</p>
        </div>
      </div>

      <StreakBadge streak={profile?.streak ?? 0} />

      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">התקדמות</h2>
        {(progress ?? []).map(p => (
          <div key={p.pillar} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-sm">{PILLAR_LABELS[p.pillar as Pillar]}</span>
              <span className="text-xs text-muted-foreground">{p.cards_completed} כרטיסים</span>
            </div>
            <XPBar xp={p.xp} level={p.level} />
          </div>
        ))}
      </div>

      {(badges ?? []).length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">תגים</h2>
          <BadgeGrid badges={badges ?? []} />
        </div>
      )}

      <form action="/api/auth/logout" method="POST" className="pt-2">
        <button className="text-sm text-muted-foreground hover:text-destructive transition-colors">
          התנתק
        </button>
      </form>
    </div>
  )
}
