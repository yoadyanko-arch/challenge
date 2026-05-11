import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { updateCardStatus } from '@/lib/supabase/queries'
import { isAdmin } from '@/lib/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  await updateCardStatus(createServiceClient(), id, 'rejected')
  return NextResponse.json({ ok: true })
}
