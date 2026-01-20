"use client"

import SnapContainer from "@/components/homepage/SnapContainer"
import ExplorerHero from "@/components/homepage/ExplorerHero"
import PlanHero from "@/components/homepage/PlanHero"
import InstallHero from "@/components/homepage/InstallHero"

export default function Home() {
  return (
    <main className="relative bg-black min-h-screen">
      <SnapContainer>
        <ExplorerHero />
        <PlanHero />
        <InstallHero />
      </SnapContainer>
    </main>
  )
}

