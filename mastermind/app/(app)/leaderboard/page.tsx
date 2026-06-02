import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/lib/supabase/queries'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Flame } from 'lucide-react'

const RANK_LABELS: Record<number, string> = { 1: '01', 2: '02', 3: '03' }

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const users = await getLeaderboard(supabase, 50)
  const { data: { user: me } } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1 tracking-tight">לידרבורד</h1>
      <p className="text-sm text-muted-foreground mb-5">מתאפס כל שבוע</p>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              u.id === me?.id
                ? 'bg-accent border-primary/30'
                : 'bg-card border-border'
            }`}
          >
            <span className={`w-7 text-center text-xs font-bold tabular-nums ${
              i === 0 ? 'text-primary' : i <= 2 ? 'text-muted-foreground' : 'text-muted-foreground/50'
            }`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                {u.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {u.username}
                {u.id === me?.id && <span className="text-muted-foreground font-normal"> (אתה)</span>}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame size={11} />
                <span className="text-xs">{u.streak}</span>
              </div>
            </div>
            <span className="font-bold text-sm text-primary tabular-nums">{u.xp_total} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
