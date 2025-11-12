interface CountryLabelProps {
  centroid: [number, number]
  countryName: string
  direction?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom'
}

export function CountryLabel({ centroid, countryName, direction = 'right-top' }: CountryLabelProps) {
  // Parse direction
  const isLeft = direction.startsWith('left')
  const isTop = direction.endsWith('top')
  
  // Calculate offsets
  const diagonalXOffset = isLeft ? -35 : 35
  const diagonalYOffset = isTop ? -35 : 40
  const textXOffset = isLeft ? -40 : 40
  const textYOffset = isTop ? -38 : 38
  
  // Calculate underline positions
  const underlineStartX = centroid[0] + diagonalXOffset
  const underlineY = centroid[1] + diagonalYOffset
  const underlineEndX = isLeft 
    ? centroid[0] - 45 - countryName.length * 7
    : centroid[0] + 45 + countryName.length * 7

  return (
    <g className="pointer-events-none">
      {/* Center dot at country centroid */}
      <circle
        cx={centroid[0]}
        cy={centroid[1]}
        r="2.5"
        fill="currentColor"
        className="text-foreground"
      />
      {/* Diagonal line extending from center */}
      <line
        x1={centroid[0]}
        y1={centroid[1]}
        x2={centroid[0] + diagonalXOffset}
        y2={centroid[1] + diagonalYOffset}
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-foreground"
        opacity="0.8"
        strokeDasharray="56.57"
        strokeDashoffset="0"
        style={{
          animation: "drawLine 0.3s ease-out forwards",
        }}
      />
      <g
        style={{
          animation: "fadeIn 0.3s ease-out forwards",
        }}
      >
        <text
          x={centroid[0] + textXOffset}
          y={centroid[1] + textYOffset}
          className="text-foreground font-medium"
          fontSize="14"
          textAnchor={isLeft ? "end" : "start"}
          style={{ pointerEvents: "none" }}
        >
          {countryName}
        </text>
        {/* Underline connecting to diagonal line */}
        <line
          x1={underlineStartX}
          y1={underlineY}
          x2={underlineEndX}
          y2={underlineY}
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-foreground"
          opacity="0.8"
          strokeDasharray={countryName.length * 7 + 5}
          strokeDashoffset="0"
          style={{
            animation: "ease-in 1s forwards",
          }}
        />
      </g>
    </g>
  )
}

