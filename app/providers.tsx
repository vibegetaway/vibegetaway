'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()
  const hasTrackedSession = useRef(false)

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
    if (isSignedIn && user && !hasTrackedSession.current) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      })

      const accountAge = user.createdAt 
        ? Date.now() - new Date(user.createdAt).getTime() 
        : Infinity
      const isNewUser = accountAge < 60000

      if (isNewUser) {
        posthog.capture('user_signed_up', {
          method: 'google',
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        })
      } else {
        posthog.capture('user_logged_in', {
          method: 'google',
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        })
      }

      hasTrackedSession.current = true
    } else if (!isSignedIn && hasTrackedSession.current) {
      posthog.capture('user_logged_out')
      posthog.reset()
      hasTrackedSession.current = false
    }
  }, [isSignedIn, user])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
