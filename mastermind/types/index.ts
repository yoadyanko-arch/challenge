export type Pillar = 'think' | 'people' | 'business' | 'self'
export type CardType = 'concept' | 'scenario' | 'challenge' | 'bias'
export type CardStatus = 'pending' | 'approved' | 'rejected'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type FriendStatus = 'pending' | 'accepted' | 'declined'

export interface Card {
  id: string
  pillar: Pillar
  type: CardType
  topic: string | null
  title: string
  content: string
  explanation: string
  options: string[] | null
  correct_answer: string | null
  source: string | null
  question: string | null
  xp_reward: number
  difficulty: Difficulty
  difficulty_level: number | null
  status: CardStatus
  created_at: string
}

export interface StoredCardResult {
  card_id: string
  card_title: string
  card_question: string | null
  was_correct: boolean | null
  user_answer: string | null
  correct_answer: string | null
  explanation: string
  xp_earned: number
  time_spent: number
  difficulty_level: number | null
  pillar: string
}

export interface LearnedSession {
  id: string
  user_id: string
  pillar: string
  topic: string | null
  score: number
  cards_data: StoredCardResult[]
  completed_at: string
  ai_summary?: string | null
}

export const PILLAR_TOPICS: Record<Pillar, { value: string; label: string }[]> = {
  think: [
    { value: 'biases', label: 'הטיות קוגניטיביות' },
    { value: 'logic', label: 'לוגיקה' },
    { value: 'statistics', label: 'סטטיסטיקה' },
    { value: 'systems', label: 'חשיבה מערכתית' },
    { value: 'history', label: 'היסטוריה' },
  ],
  people: [
    { value: 'psychology', label: 'פסיכולוגיה' },
    { value: 'negotiation', label: 'משא ומתן' },
    { value: 'communication', label: 'תקשורת' },
    { value: 'leadership', label: 'מנהיגות' },
    { value: 'persuasion', label: 'שכנוע' },
  ],
  business: [
    { value: 'real_estate', label: 'נדל"ן' },
    { value: 'stocks', label: 'שוק ההון' },
    { value: 'entrepreneurship', label: 'יזמות' },
    { value: 'sales', label: 'מכירות' },
    { value: 'marketing', label: 'שיווק' },
    { value: 'tax', label: 'מיסוי' },
    { value: 'crypto', label: 'קריפטו' },
    { value: 'strategy', label: 'אסטרטגיה' },
  ],
  self: [
    { value: 'productivity', label: 'פרודוקטיביות' },
    { value: 'habits', label: 'הרגלים' },
    { value: 'philosophy', label: 'פילוסופיה' },
    { value: 'personal_finance', label: 'פיננסים אישיים' },
  ],
}

export interface User {
  id: string
  email: string
  username: string
  avatar_url: string | null
  streak: number
  xp_total: number
  last_active: string
  created_at: string
}

export interface Progress {
  user_id: string
  pillar: Pillar
  xp: number
  cards_completed: number
  level: number
}

export interface CardHistory {
  user_id: string
  card_id: string
  completed_at: string
  was_correct: boolean
  xp_earned: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
}

export interface UserBadge {
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export type NotificationType = 'streak_reminder' | 'friend_passed' | 'badge_earned' | 'friend_request'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}

export const XP_VALUES: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  think: 'חשיבה',
  people: 'אנשים',
  business: 'עסקים',
  self: 'עצמי',
}

export const LEVEL_XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000] as const

export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}
