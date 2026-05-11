import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from '@/lib/supabase/queries'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const users = await getLeaderboard(supabase, 50)
  const { data: { user: me } } = await supabase.auth.getUser()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">🏆 לידרבורד</h1>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${u.id === me?.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}
          >
            <span className="w-6 text-center font-bold text-gray-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </span>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {u.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{u.username} {u.id === me?.id && '(אתה)'}</p>
              <p className="text-xs text-gray-400">🔥 {u.streak}</p>
            </div>
            <span className="font-bold text-indigo-600">{u.xp_total} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
