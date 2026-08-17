interface IconProps {
  size?: number
  className?: string
}

function Svg({ size = 16, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function ChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.75 3.5 5.25 8l4.5 4.5" />
    </Svg>
  )
}

export function ChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.25 3.5 10.75 8l-4.5 4.5" />
    </Svg>
  )
}

export function ChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.75 6.25 8 10.5l4.25-4.25" />
    </Svg>
  )
}

export function Download(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 2.25v7.5M5 7l3 2.75L11 7" />
      <path d="M2.75 11.5v1.25a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1V11.5" />
    </Svg>
  )
}

export function Code(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5.75 4.5 2.5 8l3.25 3.5M10.25 4.5 13.5 8l-3.25 3.5" />
    </Svg>
  )
}

export function EyeOff(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.4 3.65A6.3 6.3 0 0 1 8 3.45c3.1 0 5.2 2.4 5.85 3.75a.9.9 0 0 1 0 .6 8 8 0 0 1-1.35 1.9M9.9 10.9a5.6 5.6 0 0 1-1.9.33c-3.1 0-5.2-2.4-5.85-3.76a.9.9 0 0 1 0-.6A8.4 8.4 0 0 1 4 4.65" />
      <path d="M6.7 6.7a1.85 1.85 0 0 0 2.6 2.6M2.5 2.5l11 11" />
    </Svg>
  )
}

export function Eye(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.15 7.7C2.8 6.35 4.9 3.95 8 3.95s5.2 2.4 5.85 3.75a.9.9 0 0 1 0 .6C13.2 9.65 11.1 12.05 8 12.05s-5.2-2.4-5.85-3.75a.9.9 0 0 1 0-.6Z" />
      <circle cx="8" cy="8" r="1.85" />
    </Svg>
  )
}

export function Copy(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5.75" y="5.75" width="7.5" height="7.5" rx="1.6" />
      <path d="M10.25 5.75v-1.5a1.5 1.5 0 0 0-1.5-1.5h-4.5a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 1.5 1.5h1.5" />
    </Svg>
  )
}

export function Check(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.25 8.5l3 3 6.5-7" />
    </Svg>
  )
}

export function Close(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  )
}

export function Reset(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.4 6.6A5 5 0 1 1 3 9.3" />
      <path d="M2.6 3.2v3.5h3.5" />
    </Svg>
  )
}
