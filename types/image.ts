export interface ImageUrls {
  small: string
  regular: string
  full: string
}

export interface UnsplashImage {
  id: string
  urls: ImageUrls
  altDescription: string
}

export interface PixabayImage {
  id: number
  urls: ImageUrls
  altDescription: string
}
