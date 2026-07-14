export interface Community {
  id: string
  creator_id: string
  name: string
  description: string
  cover_url?: string
  avatar_url?: string
  monthly_price?: number
  one_time_price?: number
  member_count: number
  post_count: number
  creator?: { id: string; name: string; image: string }
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  community_id: string
  type: 'monthly' | 'one_time' | 'free'
  status: 'active' | 'cancelled' | 'expired'
  expires_at?: string
  created_at: string
}

export interface Post {
  id: string
  community_id: string
  creator_id: string
  title: string
  body: string
  type: 'text' | 'image' | 'video' | 'audio' | 'live'
  media_url?: string
  thumbnail_url?: string
  is_exclusive: boolean
  like_count: number
  comment_count: number
  liked_by_me?: boolean
  locked?: boolean
  creator?: { id: string; name: string; image: string }
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  like_count: number
  user?: { id: string; name: string; image: string }
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read_at?: string
  created_at: string
}

export interface Thread {
  id: string
  other_user: { id: string; name: string; image?: string }
  last_message: string
  last_message_at: string
  unread_count?: number
}

export interface Profile {
  id: string
  username: string
  bio: string
  avatar_url?: string
  cover_url?: string
  is_creator: boolean
  follower_count: number
  created_at: string
}
