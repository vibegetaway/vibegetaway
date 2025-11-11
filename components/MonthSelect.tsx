"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function MonthSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!value) {
      const currentMonth = new Date().getMonth()
      onChange(months[currentMonth])
    }
  }, [])

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "pl-8 pr-10 bg-transparent border-b-2 border-border",
          "text-foreground flex items-center gap-2",
          "focus:outline-none focus:border-accent",
          "transition-all duration-200",
          "hover:border-accent/50",
          "w-80",
          "py-2",
        )}
      >
        <span>{value}</span>
        <ChevronDown
          className={cn("h-5 w-5 absolute right-3 text-muted-foreground transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-card rounded-lg shadow-lg overflow-hidden z-10 max-h-[300px] overflow-y-auto">
          {months.map((month) => (
            <button
              key={month}
              type="button"
              onClick={() => {
                onChange(month)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors text-foreground"
            >
              {month}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
