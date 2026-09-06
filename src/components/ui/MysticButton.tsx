import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface MysticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export function MysticButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: MysticButtonProps) {
  const base = variant === 'primary' ? 'btn-mystic-primary' : 'btn-mystic-ghost'
  const fw = fullWidth ? 'w-full' : ''
  return (
    <button className={`${base} ${fw} ${className}`} {...props}>
      {children}
    </button>
  )
}
