import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 300,
  particleCount = 12,
  enableTilt = false,
  glowColor = "132, 0, 255",
  clickEffect = true,
  enableMagnetism = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    
    const card = cardRef.current;
    const particles: HTMLElement[] = [];
    
    // Create star particles if enabled
    if (enableStars) {
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full bg-white';
        particle.style.width = `${Math.random() * 3 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        card.appendChild(particle);
        particles.push(particle);
      }
    }
    
    // Handle mouse move for spotlight and tilt effects
    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Spotlight effect
      if (enableSpotlight) {
        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(${glowColor}, 0.1) ${spotlightRadius/4}px, transparent ${spotlightRadius}px)`;
      }
      
      // Tilt effect
      if (enableTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.5
        });
      }
    };
    
    // Handle mouse enter
    const handleMouseEnter = () => {
      setIsHovered(true);
    };
    
    // Handle mouse leave
    const handleMouseLeave = () => {
      if (!card) return;
      
      setIsHovered(false);
      
      // Reset spotlight
      if (enableSpotlight) {
        card.style.background = '';
      }
      
      // Reset tilt
      if (enableTilt) {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5
        });
      }
    };
    
    // Handle click effect
    const handleClick = (e: MouseEvent) => {
      if (!clickEffect || !card) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('div');
      ripple.className = 'absolute rounded-full bg-white/20';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.width = '0px';
      ripple.style.height = '0px';
      
      card.appendChild(ripple);
      
      gsap.to(ripple, {
        width: spotlightRadius * 2,
        height: spotlightRadius * 2,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }
      });
    };
    
    // Add event listeners
    if (enableSpotlight || enableTilt || enableMagnetism) {
      card.addEventListener('mousemove', handleMouseMove);
    }
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    if (clickEffect) {
      card.addEventListener('click', handleClick);
    }
    
    // Cleanup
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('click', handleClick);
        
        // Remove particles
        particles.forEach(particle => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
      }
    };
  }, [disableAnimations, enableStars, particleCount, enableSpotlight, enableTilt, glowColor, spotlightRadius, clickEffect]);
  
  return (
    <div 
      ref={cardRef}
      className={`relative rounded-xl border border-white/10 bg-white/5 p-6 overflow-hidden transition-all duration-300 ${className}`}
    >
      {textAutoHide && isHovered ? (
        <div className="opacity-0 transition-opacity duration-300">{children}</div>
      ) : (
        <div className="opacity-100 transition-opacity duration-300">{children}</div>
      )}
      
      {/* Border glow effect */}
      {enableBorderGlow && !disableAnimations && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none border border-white/20 transition-all duration-300"
          style={{
            boxShadow: isHovered ? `0 0 15px rgba(${glowColor}, 0.5)` : 'none'
          }}
        />
      )}
    </div>
  );
};

export default BentoCard;
