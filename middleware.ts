import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/explore(.*)',
  '/search(.*)',
  '/plan(.*)',
  '/quickstart(.*)',
  '/api/suggestions(.*)',
  '/api/generate-itinerary(.*)',
  '/api/planning/generate-itinerary-name(.*)',
  '/api/planning/plan-trip(.*)',
  '/api/planning/quickstart-itinerary(.*)',
  '/api/images/unsplash-images(.*)',
  '/api/images/pixabay-images(.*)',
  '/api/images/cached-images(.*)',
  '/api/inspiration-cards(.*)',
  '/api/city-search(.*)',
  '/api/locations(.*)',
  '/api/explore/search(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|manifest.json|sw.js|workbox-.*\\.js|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
