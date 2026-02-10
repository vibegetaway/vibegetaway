import type { Image } from '@/lib/types'

export interface PixabayImage extends Omit<Image, 'id'> {
    id: number
}
