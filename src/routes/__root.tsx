import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-dvh stars-bg" style={{ background: 'var(--bg-deep)' }}>
      <Outlet />
    </div>
  ),
})
