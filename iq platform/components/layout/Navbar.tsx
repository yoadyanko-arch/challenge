'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Trophy, Users } from 'lucide-react'

const LINKS = [
  { href: '/feed', icon: Home, label: 'פיד' },
  { href: '/leaderboard', icon: Trophy, label: 'דירוג' },
  { href: '/friends', icon: Users, label: 'חברים' },
  { href: '/profile', icon: User, label: 'פרופיל' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      {LINKS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 p-2 ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
