interface CountryLabelProps {
  centroid: [number, number]
  countryName: string
}

export function CountryLabel({ centroid, countryName }: CountryLabelProps) {
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
        x2={centroid[0] + 35}
        y2={centroid[1] - 35}
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
          x={centroid[0] + 40}
          y={centroid[1] - 38}
          className="text-foreground font-medium"
          fontSize="14"
          textAnchor="start"
          style={{ pointerEvents: "none" }}
        >
          {countryName}
        </text>
        {/* Underline connecting to diagonal line */}
        <line
          x1={centroid[0] + 35}
          y1={centroid[1] - 35}
          x2={centroid[0] + 45 + countryName.length * 7}
          y2={centroid[1] - 35}
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

