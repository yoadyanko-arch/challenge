'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) { setError(signUpError?.message ?? 'שגיאה'); setLoading(false); return }

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      username,
    })
    if (profileError) { setError(profileError.message); setLoading(false); return }

    await supabase.from('progress').insert([
      { user_id: data.user.id, pillar: 'think' },
      { user_id: data.user.id, pillar: 'people' },
      { user_id: data.user.id, pillar: 'business' },
      { user_id: data.user.id, pillar: 'self' },
    ])

    router.push('/feed')
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">הצטרף 🚀</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="username">שם משתמש</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">סיסמה</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'נרשם...' : 'הרשמה'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">התחבר</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
