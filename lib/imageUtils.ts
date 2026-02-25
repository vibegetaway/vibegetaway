export async function fetchActivityImages(activityTitle: string, location: string): Promise<{ imageUrl?: string; imageUrls?: string[] }> {
  try {
    const imageResponse = await fetch(
      `/api/images/pixabay-images?keywords=${encodeURIComponent(`${activityTitle} ${location}`)}&limit=4`
    )
    if (imageResponse.ok) {
      const imageData = await imageResponse.json()
      const images = imageData.images || []
      return {
        imageUrl: images[0]?.urls?.regular,
        imageUrls: images.map((img: any) => img.urls?.regular).filter(Boolean)
      }
    }
  } catch (error) {
    console.error(`Error fetching images:`, error)
  }
  return { imageUrl: undefined, imageUrls: [] }
}
