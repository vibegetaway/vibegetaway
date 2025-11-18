declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties, MouseEvent } from 'react'

  export interface ProjectionConfig {
    scale?: number
    center?: [number, number]
    rotate?: [number, number, number]
  }

  export interface ComposableMapProps {
    className?: string
    width?: number
    height?: number
    projection?: string
    projectionConfig?: ProjectionConfig
    style?: CSSProperties
    children?: ReactNode
  }

  export interface GeographyProps {
    geography: any
    fill?: string
    stroke?: string
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
    onMouseEnter?: (event: MouseEvent) => void
    onMouseLeave?: (event: MouseEvent) => void
    onClick?: (event: MouseEvent) => void
  }

  export interface GeographiesProps {
    geography: string | object
    children?: (params: { geographies: any[] }) => ReactNode
  }

  export interface Position {
    coordinates: [number, number]
    zoom: number
  }

  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    onMoveEnd?: (position: Position) => void
    children?: ReactNode
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const ZoomableGroup: React.FC<ZoomableGroupProps>
}

