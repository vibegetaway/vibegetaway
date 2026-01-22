export interface ImageUrls {
  small: string
  regular: string
  full: string
}

export interface BaseImage {
  urls: ImageUrls
  altDescription: string
}

export interface UnsplashImage extends BaseImage {
  id: string
}

export interface PixabayImage extends BaseImage {
  id: number
}
