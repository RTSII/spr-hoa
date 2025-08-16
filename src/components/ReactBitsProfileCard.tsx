import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_BEHIND_GRADIENT =
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)'

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)'

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
}

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)

const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision))

const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

type ReactBitsProfileCardProps = {
  avatarUrl?: string
  iconUrl?: string
  grainUrl?: string
  behindGradient?: string
  innerGradient?: string
  showBehindGradient?: boolean
  className?: string
  enableTilt?: boolean
  enableMobileTilt?: boolean
  mobileTiltSensitivity?: number
  miniAvatarUrl?: string
  name?: string
  title?: string
  handle?: string
  status?: string
  contactText?: string
  showUserInfo?: boolean
  onContactClick?: () => void
  size?: 'small' | 'medium' | 'large'
}

const ReactBitsProfileCard: React.FC<ReactBitsProfileCardProps> = ({
  avatarUrl = 'https://ext.same-assets.com/2190792149/1368075526.png',
  iconUrl = 'https://ext.same-assets.com/2190792149/9704295.png',
  grainUrl = 'https://ext.same-assets.com/2190792149/3899754992.webp',
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Resident',
  title = 'Community Member',
  handle = 'resident',
  status = 'Active',
  contactText = 'Contact',
  showUserInfo = true,
  onContactClick,
  size = 'medium',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-80 h-96',
    large: 'w-96 h-[28rem]',
  }

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null
    let rafId: number | null = null
    const updateCardTransform = (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLElement,
    ) => {
      const width = card.clientWidth
      const height = card.clientHeight
      const percentX = clamp((100 / width) * offsetX)
      const percentY = clamp((100 / height) * offsetY)
      const centerX = percentX - 50
      const centerY = percentY - 50
      const properties: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`,
      }
      Object.entries(properties).forEach(([property, value]) => {
        ;(wrap.style as CSSStyleDeclaration).setProperty(property, value)
      })
    }
    const createSmoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLElement,
    ) => {
      const startTime = performance.now()
      const targetX = wrap.clientWidth / 2
      const targetY = wrap.clientHeight / 2
      const animationLoop = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = clamp(elapsed / duration)
        const easedProgress = easeInOutCubic(progress)
        const currentX = adjust(easedProgress, 0, 1, startX, targetX)
        const currentY = adjust(easedProgress, 0, 1, startY, targetY)
        updateCardTransform(currentX, currentY, card, wrap)
        if (progress < 1) {
          rafId = requestAnimationFrame(animationLoop)
        }
      }
      rafId = requestAnimationFrame(animationLoop)
    }
    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
      },
    }
  }, [enableTilt])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const card = cardRef.current
      const wrap = wrapRef.current
      if (!card || !wrap || !animationHandlers) return
      const rect = card.getBoundingClientRect()
      animationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        card,
        wrap,
      )
    },
    [animationHandlers],
  )

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap || !animationHandlers) return
    animationHandlers.cancelAnimation()
    wrap.classList.add('active')
    card.classList.add('active')
  }, [animationHandlers])

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      const card = cardRef.current
      const wrap = wrapRef.current
      if (!card || !wrap || !animationHandlers) return
      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.nativeEvent.offsetX,
        event.nativeEvent.offsetY,
        card,
        wrap,
      )
      wrap.classList.remove('active')
      card.classList.remove('active')
    },
    [animationHandlers],
  )

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap) return

    const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET
    animationHandlers.updateCardTransform(initialX, initialY, card, wrap)
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap,
    )

    return () => {
      animationHandlers.cancelAnimation()
    }
  }, [enableTilt, animationHandlers])

  const cardStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        '--icon': iconUrl ? `url(${iconUrl})` : 'none',
        '--grain': grainUrl ? `url(${grainUrl})` : 'none',
        '--behind-gradient': showBehindGradient
          ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
          : 'none',
        '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
        '--card-opacity': size === 'small' ? '0.6' : '0.8',
      }) as React.CSSProperties,
    [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient, size],
  )

  const handleContactClick = useCallback(() => {
    onContactClick?.()
  }, [onContactClick])

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${sizeClasses[size]} ${className}`.trim()}
      style={cardStyle}
    >
      <section
        ref={cardRef}
        className="pc-card"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name || 'User'} avatar`}
              loading="lazy"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            {showUserInfo && size !== 'small' && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name || 'User'} mini avatar`}
                      loading="lazy"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement
                        target.style.opacity = '0.5'
                        target.src = avatarUrl
                      }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={handleContactClick}
                  style={{ pointerEvents: 'auto' }}
                  type="button"
                  aria-label={`Contact ${name || 'user'}`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>
          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .pc-card-wrapper {
          --card-opacity: 0.8;
          --pointer-x: 50%;
          --pointer-y: 50%;
          --background-x: 50%;
          --background-y: 50%;
          --pointer-from-center: 0;
          --pointer-from-top: 0.5;
          --pointer-from-left: 0.5;
          --rotate-x: 0deg;
          --rotate-y: 0deg;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .pc-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          background: var(--behind-gradient);
          transform: rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
          transition: transform 0.1s ease-out;
          overflow: hidden;
        }

        .pc-inside {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--inner-gradient);
          border-radius: 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .pc-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--pointer-x) var(--pointer-y),
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 20%,
            transparent 50%
          );
          opacity: var(--pointer-from-center);
          transition: opacity 0.2s ease;
        }

        .pc-glare {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 70%
          );
          transform: translateX(calc(var(--pointer-x) - 50%))
            translateY(calc(var(--pointer-y) - 50%));
          opacity: calc(var(--pointer-from-center) * 0.5);
          transition: opacity 0.2s ease;
        }

        .pc-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem;
        }

        .pc-avatar-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .avatar {
          width: 80%;
          height: 80%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .pc-details h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.25rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .pc-details p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .pc-user-info {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pc-user-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .pc-mini-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .pc-mini-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pc-user-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .pc-handle {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          line-height: 1;
        }

        .pc-status {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1;
        }

        .pc-contact-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .pc-contact-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }

        /* Small size overrides */
        .w-20.h-20 .pc-content {
          padding: 0.5rem;
        }

        .w-20.h-20 .pc-details h3 {
          font-size: 0.75rem;
          margin: 0;
        }

        .w-20.h-20 .pc-details p {
          font-size: 0.625rem;
        }

        .w-20.h-20 .avatar {
          width: 90%;
          height: 90%;
        }
      `}</style>
    </div>
  )
}

export default ReactBitsProfileCard
