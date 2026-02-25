'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Map, Sparkles, Calendar } from "lucide-react"
import Image from "next/image"
import { SignInButton, UserButton, useUser } from "@clerk/nextjs"

export function Header() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
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
                  aria-label="Close Menu"
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
                      <Map className="w-5 h-5" />
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/search")
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/10 text-foreground hover:text-secondary transition-colors flex items-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Search
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
    </>
  )
}

