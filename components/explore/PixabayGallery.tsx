'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Image as ImageType } from '@/app/api/images/types'

interface PixabayGalleryProps {
    keywords: string
    imageCount?: number
}

export default function PixabayGallery({ keywords, imageCount = 8 }: PixabayGalleryProps) {
    const [images, setImages] = useState<ImageType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true)
            setError(false)

            try {
                const response = await fetch(
                    `/api/images/pixabay-images?keywords=${encodeURIComponent(keywords)}&limit=${imageCount}`
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch images')
                }

                const data = await response.json()
                setImages(data.images || [])
            } catch (err) {
                console.error('Error fetching Pixabay images:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (keywords) {
            fetchImages()
        }
    }, [keywords, imageCount])

    const openLightbox = (index: number) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLightboxIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
    }
    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
    }

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-1 h-32 md:h-48">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse w-full h-full object-cover" />
                ))}
            </div>
        )
    }

    if (error || images.length === 0) {
        return (
            <div className="h-32 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                No images available
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-4 grid-rows-2 gap-1 h-48 md:h-64 overflow-hidden rounded-b-2xl">
                {images.slice(0, imageCount).map((image, index) => (
                    <div
                        key={image.id}
                        className="relative cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={image.urls.small}
                            alt={image.altDescription || 'Travel location'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 150px"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[10002] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <div className="relative w-full max-w-4xl max-h-[80vh] aspect-video">
                        <Image
                            src={images[lightboxIndex].urls.regular}
                            alt={images[lightboxIndex].altDescription || 'Travel location'}
                            fill
                            className="object-contain"
                            quality={90}
                        />
                    </div>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>

                    <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
                        {lightboxIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    )
}
