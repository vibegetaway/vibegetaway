import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { PostHogProvider } from "./providers"
import { ClerkProvider } from "@clerk/nextjs"

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
}

export const metadata: Metadata = {
  title: "VibeGetaway - Plan your perfect getaway",
  description: "Create memorable experiences with AI-powered itineraries tailored to your travel style",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VibeGetaway",
  },
  icons: {
    icon: "/assets/icon.png",
    apple: "/assets/icon-180.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "z-[9999]",
          card: "shadow-2xl border border-border rounded-2xl",
          headerTitle: "font-bold",
          socialButtonsBlockButton: "border-border hover:bg-accent transition-all",
          formButtonPrimary: "bg-primary hover:bg-primary/90 transition-all",
          footerActionLink: "text-primary hover:text-primary/90",
          modalBackdrop: "bg-black/50 backdrop-blur-sm",
          modalContent: "rounded-2xl",
        }
      }}
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="font-sans antialiased">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

