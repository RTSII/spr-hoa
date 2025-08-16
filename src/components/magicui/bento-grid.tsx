import React, { useState, useRef, useEffect } from 'react'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  )
}

export default BentoGrid
