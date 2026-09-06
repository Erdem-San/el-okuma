import type { ReactNode } from 'react'

interface MysticCardProps {
  children: ReactNode
  className?: string
  glow?: 'gold' | 'purple' | 'none'
}

export function MysticCard({ children, className = '', glow = 'none' }: MysticCardProps) {
  const glowClass = glow === 'gold' ? 'glow-gold' : glow === 'purple' ? 'glow-purple' : ''
  return (
    <div className={`mystic-card p-5 sm:p-6 ${glowClass} ${className}`}>
      {children}
    </div>
  )
}
