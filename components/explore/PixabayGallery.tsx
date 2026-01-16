'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PixabayGalleryProps {
    keywords: string
    imageCount?: number
}

interface PixabayImage {
    id: number
    webformatURL: string
    tags: string
}

export default function PixabayGallery({ keywords, imageCount = 6 }: PixabayGalleryProps) {
    const [images, setImages] = useState<PixabayImage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true)
            setError(false)

            try {
                const response = await fetch(
                    `/api/images/pixabay-images?keywords=${encodeURIComponent(keywords)}&count=${imageCount}`
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

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: imageCount }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (error || images.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                No images available
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {images.slice(0, imageCount).map((image) => (
                <div key={image.id} className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                        src={image.webformatURL}
                        alt={image.tags}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 200px"
                    />
                </div>
            ))}
        </div>
    )
}
