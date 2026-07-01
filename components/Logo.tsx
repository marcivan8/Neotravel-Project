interface LogoProps {
  theme?: 'light' | 'dark'
  height?: number
  className?: string
}

export default function Logo({ theme = 'light', height = 40, className }: LogoProps) {
  const src = theme === 'dark' ? '/brand/svg/neotravel-logo-white.svg' : '/brand/svg/neotravel-logo.svg'

  return (
    <img
      src={src}
      alt="NeoTravel"
      height={height}
      className={className}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
