import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/explore(.*)',
  '/plan(.*)',
  '/quickstart(.*)',
  '/api/suggestions(.*)',
  '/api/generate-itinerary(.*)',
  '/api/generate-itinerary-name(.*)',
  '/api/plan-trip(.*)',
  '/api/quickstart-itinerary(.*)',
  '/api/unsplash-images(.*)',
  '/api/city-search(.*)',
  '/api/locations(.*)',
  '/api/cached-images(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Redirect /inspire to /explore
  if (request.nextUrl.pathname.startsWith('/inspire')) {
    const url = request.nextUrl.clone()
    url.pathname = url.pathname.replace(/^\/inspire/, '/explore')
    return NextResponse.redirect(url)
  }

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
