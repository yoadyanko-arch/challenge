'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Trophy, Users, User, Settings } from 'lucide-react'

interface NavbarProps {
  isAdmin?: boolean
}

const LINKS = [
  { href: '/feed', icon: LayoutGrid, label: 'פיד' },
  { href: '/leaderboard', icon: Trophy, label: 'דירוג' },
  { href: '/friends', icon: Users, label: 'חברים' },
  { href: '/profile', icon: User, label: 'פרופיל' },
]

export default function Navbar({ isAdmin }: NavbarProps) {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-1.5 z-50 shadow-sm">
      {LINKS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings size={20} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 1.8} />
          <span className="text-[10px] font-medium">ניהול</span>
        </Link>
      )}
    </nav>
  )
}
