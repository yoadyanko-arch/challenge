function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysDiff(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)
}

export function shouldUpdateStreak(lastActive: string): boolean {
  const last = new Date(lastActive)
  const now = new Date()
  const diff = daysDiff(now, last)
  return diff === 1
}

export function isStreakBroken(lastActive: string): boolean {
  const last = new Date(lastActive)
  const now = new Date()
  return daysDiff(now, last) >= 2
}
