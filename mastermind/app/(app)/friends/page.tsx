'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, Flame } from 'lucide-react'

interface Friend {
  friend_id: string
  status: string
  users: { username: string; xp_total: number; streak: number }
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/friends').then(r => r.json()).then(setFriends)
  }, [])

  async function addFriend() {
    if (!search.trim()) return
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: search }),
    })
    const data = await res.json()
    setMsg(data.ok ? 'חבר נוסף!' : data.error)
    if (data.ok) {
      setSearch('')
      fetch('/api/friends').then(r => r.json()).then(setFriends)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold tracking-tight">חברים</h1>

      <div className="flex gap-2">
        <Input
          placeholder="שם משתמש..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFriend()}
          className="h-10"
        />
        <Button onClick={addFriend} size="sm" className="h-10 gap-1.5">
          <UserPlus size={15} />
          הוסף
        </Button>
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msg === 'חבר נוסף!' ? 'text-emerald-600' : 'text-destructive'}`}>
          {msg}
        </p>
      )}

      <div className="space-y-2">
        {friends.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-10">
            עוד אין חברים — הוסף מישהו
          </p>
        )}
        {friends.map(f => (
          <div key={f.friend_id} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                {f.users.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{f.users.username}</p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame size={11} />
                <span className="text-xs">{f.users.streak}</span>
              </div>
            </div>
            <span className="text-primary font-bold text-sm tabular-nums">{f.users.xp_total} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
