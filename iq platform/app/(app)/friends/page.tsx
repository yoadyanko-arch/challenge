'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
      <h1 className="text-xl font-bold">👥 חברים</h1>

      <div className="flex gap-2">
        <Input
          placeholder="שם משתמש..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFriend()}
        />
        <Button onClick={addFriend}>הוסף</Button>
      </div>
      {msg && <p className={`text-sm ${msg === 'חבר נוסף!' ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}

      <div className="space-y-2">
        {friends.length === 0 && <p className="text-gray-400 text-sm text-center py-6">עוד אין חברים — הוסף מישהו!</p>}
        {friends.map(f => (
          <div key={f.friend_id} className="flex items-center gap-3 bg-white p-3 rounded-xl border">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {f.users.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{f.users.username}</p>
              <p className="text-xs text-gray-400">🔥 {f.users.streak}</p>
            </div>
            <span className="text-indigo-600 font-bold text-sm">{f.users.xp_total} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
