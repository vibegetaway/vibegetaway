export interface PixabayImage {
    id: number
    urls: {
        small: string
        regular: string
        full: string
    }
    altDescription: string
}
