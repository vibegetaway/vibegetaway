"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Menu, X, Globe, Home as HomeIcon, Calendar } from "lucide-react"
import { MobileNav } from "@/components/MobileNav"
import { usePostHog } from "posthog-js/react"
import Image from "next/image"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Download } from "lucide-react"

interface OptionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  locked?: boolean
  accentColor?: 'primary' | 'secondary' | 'chart-3'
  backgroundPattern?: 'world-map' | 'sun-route' | 'calendar' | 'group'
}

function OptionCard({ title, description, icon, href, locked = false, accentColor = 'primary', backgroundPattern = 'world-map' }: OptionCardProps) {
  const router = useRouter()
  const posthog = usePostHog()

  const handleClick = () => {
    if (locked) return
    posthog?.capture("landing_option_clicked", { option: title, href })
    router.push(href)
  }

  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary/20 to-primary/30 group-hover:from-primary/30 group-hover:to-primary/40',
      text: 'text-primary',
      border: 'border-primary/20',
    },
    secondary: {
      bg: 'bg-gradient-to-br from-secondary/25 to-secondary/35 group-hover:from-secondary/35 group-hover:to-secondary/45',
      text: 'text-secondary',
      border: 'border-secondary/20',
    },
    'chart-3': {
      bg: 'bg-gradient-to-br from-accent/25 to-chart-3/35 group-hover:from-accent/35 group-hover:to-chart-3/45',
      text: 'text-accent',
      border: 'border-accent/20',
    },
  }

  const backgroundPatterns = {
    'world-map': '/assets/homepage/world-map-simple.png',
    'sun-route': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='currentColor' stroke-width='1.5' opacity='0.6'%3E%3Ccircle cx='100' cy='50' r='15'/%3E%3Cline x1='100' y1='25' x2='100' y2='10'/%3E%3Cline x1='100' y1='75' x2='100' y2='90'/%3E%3Cline x1='75' y1='50' x2='60' y2='50'/%3E%3Cline x1='125' y1='50' x2='140' y2='50'/%3E%3Cline x1='82' y1='32' x2='71' y2='21'/%3E%3Cline x1='118' y1='32' x2='129' y2='21'/%3E%3Cline x1='82' y1='68' x2='71' y2='79'/%3E%3Cline x1='118' y1='68' x2='129' y2='79'/%3E%3Cpath d='M30,120 Q50,110 70,120 T110,120 T150,120' stroke-dasharray='3,3'/%3E%3Ccircle cx='30' cy='120' r='3' fill='currentColor'/%3E%3Ccircle cx='70' cy='120' r='3' fill='currentColor'/%3E%3Ccircle cx='110' cy='120' r='3' fill='currentColor'/%3E%3Ccircle cx='150' cy='120' r='3' fill='currentColor'/%3E%3Cpath d='M40,160 L50,150 L55,155 L45,165 Z' fill='currentColor' opacity='0.4'/%3E%3Cpath d='M90,165 L100,155 L105,160 L95,170 Z' fill='currentColor' opacity='0.4'/%3E%3Cpath d='M140,155 L150,145 L155,150 L145,160 Z' fill='currentColor' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`,
    'calendar': '/assets/homepage/calendar-simple.png',
    'calendar-svg': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='currentColor' stroke-width='1.5'%3E%3Crect x='30' y='40' width='60' height='60' rx='4'/%3E%3Cline x1='35' y1='35' x2='35' y2='45'/%3E%3Cline x1='85' y1='35' x2='85' y2='45'/%3E%3Cline x1='30' y1='55' x2='90' y2='55'/%3E%3Crect x='110' y='40' width='60' height='60' rx='4'/%3E%3Cline x1='115' y1='35' x2='115' y2='45'/%3E%3Cline x1='165' y1='35' x2='165' y2='45'/%3E%3Cline x1='110' y1='55' x2='170' y2='55'/%3E%3Crect x='30' y='120' width='60' height='60' rx='4'/%3E%3Cline x1='35' y1='115' x2='35' y2='125'/%3E%3Cline x1='85' y1='115' x2='85' y2='125'/%3E%3Cline x1='30' y1='135' x2='90' y2='135'/%3E%3Cpath d='M45,70 L50,75 L65,60' stroke-width='2' fill='none'/%3E%3Ccircle cx='140' cy='75' r='8' fill='currentColor' opacity='0.3'/%3E%3Ccircle cx='60' cy='155' r='8' fill='currentColor' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
    'group': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='currentColor' opacity='0.5'%3E%3Ccircle cx='60' cy='50' r='12'/%3E%3Cpath d='M40,90 Q60,75 80,90 L80,95 L40,95 Z'/%3E%3Ccircle cx='140' cy='50' r='12'/%3E%3Cpath d='M120,90 Q140,75 160,90 L160,95 L120,95 Z'/%3E%3Ccircle cx='100' cy='75' r='15'/%3E%3Cpath d='M75,125 Q100,105 125,125 L125,130 L75,130 Z'/%3E%3Ccircle cx='60' cy='140' r='10'/%3E%3Cpath d='M45,175 Q60,163 75,175 L75,180 L45,180 Z'/%3E%3Ccircle cx='140' cy='140' r='10'/%3E%3Cpath d='M125,175 Q140,163 155,175 L155,180 L125,180 Z'/%3E%3C/g%3E%3C/svg%3E")`
  }

  const colors = colorClasses[accentColor]
  const bgPattern = backgroundPatterns[backgroundPattern]

  return (
    <div
      onClick={handleClick}
      className={`
        group relative ${locked ? "overflow-visible" : "overflow-hidden"}
        rounded-2xl bg-card backdrop-blur-sm
        transition-all duration-300
        ${locked
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:shadow-2xl hover:-translate-y-2 active:scale-98"
        }
        border ${colors.border}
        p-6 sm:p-8
      `}
    >
      {/* Background pattern */}
      <div
        className={`absolute inset-0 pointer-events-none ${backgroundPattern === 'world-map'
          ? 'opacity-[0.15]'
          : backgroundPattern === 'calendar'
            ? 'opacity-[0.10]'
            : 'opacity-[0.04]'
          }`}
        style={{
          backgroundImage: typeof bgPattern === 'string' && bgPattern.startsWith('/')
            ? `url(${bgPattern})`
            : bgPattern,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 flex flex-col space-y-4">
        <div
          className={`
          inline-flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14 rounded-xl 
          ${colors.bg}
          transition-all duration-300
          ${!locked && "group-hover:scale-110"}
        `}
        >
          <div className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`}>{icon}</div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {!locked && (
          <div className="flex items-center justify-end">
            <svg
              className={`w-5 h-5 ${colors.text} transition-transform group-hover:translate-x-1`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}

        {locked && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Premium feature</span>
          </div>
        )}
      </div>
    </div>
  )
}



export default function Home() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) {
      setPlatform('ios')
    } else if (isAndroid) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isStandalone) {
      return
    }

    if (platform === 'ios') {
      setShowIOSInstructions(true)
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        setDeferredPrompt(null)
      } catch (error) {
        setShowAndroidInstructions(true)
      }
    } else {
      setShowAndroidInstructions(true)
    }
  }



  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 via-secondary/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 relative">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
              <div className="h-8 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/assets/branding/banner.png"
                  alt="VibeGetaway"
                  width={200}
                  height={50}
                  className="h-full w-auto object-contain"
                />
              </div>
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                {isSignedIn ? (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50 hover:ring-primary/50 transition-all shadow-sm",
                        userButtonPopoverCard: "shadow-2xl border border-border rounded-xl",
                      }
                    }}
                  />
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-4 sm:px-5 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-sm font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Menu"
              >
                {showMenu ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-in Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 md:z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-0 right-0 h-full w-80 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        router.push("/")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors flex items-center gap-3"
                    >
                      <HomeIcon className="w-5 h-5" />
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/explore")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/10 text-foreground hover:text-secondary transition-colors flex items-center gap-3"
                    >
                      <Globe className="w-5 h-5" />
                      Explorer
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/itineraries")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/10 text-foreground hover:text-accent transition-colors flex items-center gap-3"
                    >
                      <Calendar className="w-5 h-5" />
                      My Trips
                    </button>
                  </li>
                  <li className="pt-4 mt-4 border-t border-border">
                    <button
                      onClick={() => {
                        router.push("/about")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/pricing")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Pricing
                    </button>
                  </li>
                </ul>
              </nav>

              <div className="p-6 border-t border-border md:hidden">
                {isSignedIn ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account</span>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-full ring-2 ring-border/50",
                          userButtonPopoverCard: "shadow-2xl border border-border rounded-xl",
                        }
                      }}
                    />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground py-3 rounded-xl font-semibold transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20 pb-24 md:pb-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-6 sm:py-8 lg:py-10 space-y-4">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Plan your perfect</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                getaway
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Create memorable experiences with AI-powered itineraries tailored to your travel style
            </p>
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-sm font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl mx-auto"
              >
                <Download className="w-4 h-4" />
                {platform === 'ios' ? 'Add to Home Screen' : 'Install App'}
              </button>
            )}
          </div>
        </section>

        {/* iOS Installation Instructions Modal */}
        {showIOSInstructions && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <div
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Install VibeGetaway</h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="text-foreground font-medium">To install this app on iOS:</p>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Tap the <span className="inline-flex items-center mx-1 px-2 py-0.5 bg-primary/10 text-primary rounded">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                    </svg>
                  </span> Share button in your browser</li>
                  <li>Scroll down and tap <span className="font-semibold text-foreground">"Add to Home Screen"</span></li>
                  <li>Tap <span className="font-semibold text-foreground">"Add"</span> to confirm</li>
                </ol>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    The app will open in fullscreen mode for a native app experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Android Installation Instructions Modal */}
        {showAndroidInstructions && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAndroidInstructions(false)}
          >
            <div
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Install VibeGetaway</h3>
                <button
                  onClick={() => setShowAndroidInstructions(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="text-foreground font-medium">To install this app on Android:</p>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Tap the <span className="font-semibold text-foreground">menu button</span> in your browser</li>
                  <li>Select <span className="font-semibold text-foreground">"Add to Home screen"</span> or <span className="font-semibold text-foreground">"Install app"</span></li>
                  <li>Tap <span className="font-semibold text-foreground">"Install"</span> to confirm</li>
                </ol>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    The app will open in fullscreen mode and receive updates automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <OptionCard
              title="Explorer"
              description="Discover destinations on an interactive world map with curated locations from around the globe"
              icon={<Globe className="w-full h-full" />}
              href="/explore"
              accentColor="primary"
              backgroundPattern="world-map"
            />

            <OptionCard
              title="Plan My Trip"
              description="Create your perfect adventure with AI-powered itineraries tailored to your travel style"
              icon={<Sparkles className="w-full h-full" />}
              href="/plan"
              accentColor="secondary"
              backgroundPattern="calendar"
            />
          </div>
        </section>


      </div>

      <MobileNav activePage="home" />
    </main>
  )
}
