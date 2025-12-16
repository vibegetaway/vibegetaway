'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

      if (key && host) {
        posthog.init(key, {
          api_host: host,
          person_profiles: 'identified_only',
        })
      } else {
        console.warn('PostHog environment variables missing')
      }
    }
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      })
    } else if (!isSignedIn) {
      posthog.reset()
    }
  }, [isSignedIn, user])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
