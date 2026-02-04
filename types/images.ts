export interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
    full: string
  }
  altDescription: string
}

export interface PixabayImage {
    id: number
    urls: {
        small: string
        regular: string
        full: string
    }
    altDescription: string
}
