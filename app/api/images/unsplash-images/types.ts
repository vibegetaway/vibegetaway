import type { Image } from '@/lib/types'

export interface UnsplashImage extends Omit<Image, 'id'> {
  id: string
}
