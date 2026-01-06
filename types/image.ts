export interface UnsplashImage {
  id: string
  urls: {
    regular: string
    small: string
    full?: string
  }
  altDescription: string
  user: {
    name: string
  }
}
