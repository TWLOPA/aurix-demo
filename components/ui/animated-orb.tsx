'use client'

interface AnimatedOrbProps {
  size?: number
  className?: string
}

export function AnimatedOrb({ size = 32, className = '' }: AnimatedOrbProps) {
  const blobSize = size * 0.85
  const blobHeight = size * 0.76

  // Static gradient - no rotation
  const staticGradient = `conic-gradient(
    from 180deg at 50% 50%,
    #3D75D8 11.59deg,
    #2A68D2 26.32deg,
    #75BEE5 32.39deg,
    #52D0E9 38.91deg,
    #2159BA 75.35deg,
    #3A74DA 85.04deg,
    #6CD7EC 94.53deg,
    #5AB9F1 122.11deg,
    #33A1E5 129.97deg,
    #1F5FCF 136.72deg,
    #2C54CA 144.31deg,
    #3A9ECF 175.98deg,
    #3167C5 183.87deg,
    #ADE8F3 201.63deg,
    #D8F1F5 224.87deg,
    #A5DBE6 239.73deg,
    #2B9DD6 268.17deg,
    #AEE0E9 286.21deg,
    #20BAD0 329.65deg,
    #1E53B0 343.55deg,
    #2F40D2 359.26deg
  )`

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Static conic gradient background */}
      <div 
        className="absolute inset-0 rounded-full" 
        style={{ background: staticGradient }}
      />
      
      {/* Single animated blob */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
        <div 
          className="absolute animate-orb-blob"
          style={{
            width: blobSize,
            height: blobHeight,
            mixBlendMode: 'color-burn',
            opacity: 0.6,
          }}
        >
          <svg fill="none" viewBox="0 0 69 62" width="100%" height="100%">
            <path 
              d="M68.7734 33.1565C68.7734 50.8143 54.8419 50.2083 37.1595 57.6685C9.29647 69.4239 -3.02753 48.6097 1.79535 33.1565C6.24263 18.9068 13.2565 20.2731 18.9414 14.5061C24.7763 8.58692 27.0948 0.118652 36.0884 0.118652C53.8442 0.118652 68.7734 15.4988 68.7734 33.1565Z" 
              fill="#1C366A" 
              fillOpacity="0.35"
            />
          </svg>
        </div>
      </div>
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-full">
        <svg fill="none" viewBox="0 0 407 407" width="100%" height="100%">
          <g filter="url(#orbGlowSmall)">
            <circle cx="203.5" cy="203.5" r="203.5" fill="#16E1FF" fillOpacity=".01" />
          </g>
          <defs>
            <filter id="orbGlowSmall" x="0" y="-17.443" width="407" height="453.514" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="29.071" />
              <feGaussianBlur stdDeviation="58.143" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix values="0 0 0 0 0.552941 0 0 0 0 1 0 0 0 0 1 0 0 0 0.8 0" />
              <feBlend in2="shape" result="effect1" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="-17.443" />
              <feGaussianBlur stdDeviation="23.257" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix values="0 0 0 0 0.153563 0 0 0 0 0.272554 0 0 0 0 0.748518 0 0 0 0.6 0" />
              <feBlend in2="effect1" result="effect2" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}

