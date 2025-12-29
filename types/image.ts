// Image types originally from app/api/unsplash-images/types.ts

export interface UnsplashImage {
  id: string
  width: number
  height: number
  color: string
  blur_hash: string
  description?: string | null
  altDescription: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
    small_s3: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  user: {
    id: string
    username: string
    name: string
    links: {
      self: string
      html: string
      photos: string
      likes: string
      portfolio: string
      following: string
      followers: string
    }
    profile_image: {
      small: string
      medium: string
      large: string
    }
  }
}
