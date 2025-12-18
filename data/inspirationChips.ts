import { LucideIcon, Heart, Sparkles, Mountain, Laptop } from 'lucide-react'

export interface InspirationChip {
  id: string
  label: string
  icon: LucideIcon
  destinations: string[]
  vibes: string[]
}

export const inspirationChips: InspirationChip[] = [
  {
    id: 'honeymoon',
    label: 'Honeymoon',
    icon: Heart,
    destinations: ['Hawaii', 'Bora Bora', 'Maldives', 'Santorini', 'Bali'],
    vibes: ['romance', 'build relationship', 'relax', 'luxury']
  },
  {
    id: 'burnout-recovery',
    label: 'Burnout recovery',
    icon: Sparkles,
    destinations: ['Iceland', 'New Zealand', 'Costa Rica', 'Norway', 'Switzerland'],
    vibes: ['relax', 'recharge', 'nature', 'peace', 'wellness']
  },
  {
    id: 'adventure-seeker',
    label: 'Adventure seeker',
    icon: Mountain,
    destinations: ['Nepal', 'Patagonia', 'Peru', 'Tanzania', 'Iceland'],
    vibes: ['adventure', 'hike', 'explore', 'challenge yourself', 'adrenaline']
  },
  {
    id: 'digital-nomad',
    label: 'Digital nomad',
    icon: Laptop,
    destinations: ['Portugal', 'Thailand', 'Mexico', 'Colombia', 'Indonesia'],
    vibes: ['work remotely', 'explore', 'coworking', 'network', 'culture']
  }
]


