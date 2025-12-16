import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { PostHogProvider } from './providers'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'VibeGetaway',
  description: 'Find your next adventure',
  icons: {
    icon: '/assets/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "z-[9999]",
          card: "shadow-2xl border border-violet-200 rounded-2xl",
          headerTitle: "text-violet-900 font-bold",
          headerSubtitle: "text-violet-600",
          socialButtonsBlockButton: "border-violet-300 hover:border-violet-400 transition-all",
          formButtonPrimary: "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 transition-all",
          footerActionLink: "text-violet-600 hover:text-violet-700",
          modalBackdrop: "bg-black/50 backdrop-blur-sm",
          modalContent: "rounded-2xl",
        }
      }}
    >
      <html lang="en" className="w-full h-full">
        <body className="w-full h-full m-0 p-0 overflow-hidden">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

