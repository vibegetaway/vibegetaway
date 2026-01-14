"use client"

import React from "react"

interface SnapContainerProps {
    children: React.ReactNode
}

export default function SnapContainer({ children }: SnapContainerProps) {
    return (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
            {children}
        </div>
    )
}
