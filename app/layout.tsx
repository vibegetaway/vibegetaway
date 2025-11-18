import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" className="w-full h-full">
      <body className="w-full h-full m-0 p-0 overflow-hidden">{children}</body>
    </html>
  )
}

