'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/feed')
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!email) { setError('הכנס אימייל תחילה'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setInfo('נשלח מייל לאיפוס סיסמה — בדוק את תיבת הדואר שלך')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mastermind</h1>
        <p className="text-muted-foreground mt-1 text-sm">כניסה לחשבון</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">אימייל</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">סיסמה</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? 'נכנס...' : 'כניסה'}
        </Button>
      </form>

      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-foreground transition-colors">
          צור חשבון
        </Link>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="hover:text-foreground transition-colors"
        >
          שכחתי סיסמה
        </button>
      </div>
    </div>
  )
}
