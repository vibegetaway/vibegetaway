'use client'

import { useState } from 'react'
import WorldMap from '@/components/WorldMap'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Home() {

  return (
    <main>
      <WorldMap />
    </main>
  )
}

