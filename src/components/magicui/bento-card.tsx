import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  enableStars?: boolean
  enableSpotlight?: boolean // deprecated: no-op to satisfy existing callers
  enableBorderGlow?: boolean // deprecated: no-op (we removed glow)
  disableAnimations?: boolean
  spotlightRadius?: number
  particleCount?: number
  enableTilt?: boolean
  glowColor?: string
  clickEffect?: boolean
  enableMagnetism?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  enableStars = true,
  enableSpotlight: _enableSpotlight = false,
  enableBorderGlow: _enableBorderGlow = false,
  disableAnimations = false,
  spotlightRadius = 300,
  particleCount = 12,
  enableTilt = true,
  glowColor = '132, 0, 255',
  clickEffect = true,
  enableMagnetism = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  // hover state no longer needed; effects are purely transform-based

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return

    const card = cardRef.current
    const particles: HTMLElement[] = []

    // Create star particles if enabled
    if (enableStars) {
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'absolute rounded-full bg-white'
        particle.style.width = `${Math.random() * 3 + 1}px`
        particle.style.height = particle.style.width
        particle.style.opacity = `${Math.random() * 0.5 + 0.1}`
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        card.appendChild(particle)
        particles.push(particle)
      }
    }

    // Handle mouse move for tilt and magnetism effects
    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Tilt effect
      if (enableTilt) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 12 // slightly softer
        const rotateY = (centerX - x) / 12

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 800,
          duration: 0.4,
          ease: 'power2.out',
        })
      }

      // Magnetism effect: subtle translation toward cursor
      if (enableMagnetism) {
        const strength = 8 // max px offset
        const dx = (x / rect.width - 0.5) * 2 // -1..1
        const dy = (y / rect.height - 0.5) * 2
        gsap.to(card, {
          x: dx * strength,
          y: dy * strength,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    // Handle mouse leave
    const handleMouseLeave = () => {
      if (!card) return

      // Reset transforms for tilt/magnetism

      // Reset tilt
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      })
    }

    // Handle click effect
    const handleClick = (e: MouseEvent) => {
      if (!clickEffect || !card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ripple = document.createElement('div')
      ripple.className = 'absolute rounded-full bg-white/20'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.style.transform = 'translate(-50%, -50%)'
      ripple.style.width = '0px'
      ripple.style.height = '0px'

      card.appendChild(ripple)

      gsap.to(ripple, {
        width: spotlightRadius * 2,
        height: spotlightRadius * 2,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple)
          }
        },
      })
    }

    // Add event listeners
    if (enableTilt || enableMagnetism) {
      card.addEventListener('mousemove', handleMouseMove)
    }

    card.addEventListener('mouseleave', handleMouseLeave)

    if (clickEffect) {
      card.addEventListener('click', handleClick)
    }

    // Cleanup
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('mouseleave', handleMouseLeave)
        card.removeEventListener('click', handleClick)

        // Remove particles
        particles.forEach((particle) => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        })
      }
    }
  }, [
    disableAnimations,
    enableStars,
    particleCount,
    enableTilt,
    glowColor,
    spotlightRadius,
    clickEffect,
  ])

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 will-change-transform ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Always keep inner content fully visible */}
      <div className="opacity-100 transition-opacity duration-300">{children}</div>
    </div>
  )
}

export default BentoCard
