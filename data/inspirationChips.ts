export interface InspirationChip {
  id: string
  label: string
  icon: string
  destinations: string[]
  vibes: string[]
}

export const inspirationChips: InspirationChip[] = [
  {
    id: 'honeymoon',
    label: 'Honeymoon',
    icon: '💕',
    destinations: ['Hawaii', 'Bora Bora', 'Maldives', 'Santorini', 'Bali'],
    vibes: ['romance', 'build relationship', 'relax', 'luxury']
  },
  {
    id: 'burnout-recovery',
    label: 'Burnout recovery',
    icon: '🧘',
    destinations: ['Iceland', 'New Zealand', 'Costa Rica', 'Norway', 'Switzerland'],
    vibes: ['relax', 'recharge', 'nature', 'peace', 'wellness']
  },
  {
    id: 'adventure-seeker',
    label: 'Adventure seeker',
    icon: '🏔️',
    destinations: ['Nepal', 'Patagonia', 'Peru', 'Tanzania', 'Iceland'],
    vibes: ['adventure', 'hike', 'explore', 'challenge yourself', 'adrenaline']
  },
  {
    id: 'digital-nomad',
    label: 'Digital nomad',
    icon: '💻',
    destinations: ['Portugal', 'Thailand', 'Mexico', 'Colombia', 'Indonesia'],
    vibes: ['work remotely', 'explore', 'coworking', 'network', 'culture']
  }
]
