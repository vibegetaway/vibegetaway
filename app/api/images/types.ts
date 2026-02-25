export interface Image {
  id: string | number
  urls: {
    small: string
    regular: string
    full: string
  }
  altDescription: string
}
