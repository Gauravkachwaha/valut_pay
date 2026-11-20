import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

export default function SidebarShell({
  navItems,
  titles,
  subtitle = 'Premium Finance',
  fallbackTitle = 'PayVault',
  fallbackRole = 'Member',
  topBarRight = null,
  children,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initial = user?.name?.[0]?.toUpperCase() || 'U'
  const pageTitle = titles[location.pathname] || fallbackTitle

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-cred-border p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient shadow-cred-gold">
            <span className="font-black text-black">P</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold tracking-tight text-white">PayVault</p>
            <p className="truncate text-xs text-cred-text-muted">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-cred-text-muted transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-3 mt-6 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-cred-text-muted">
        Main Menu
      </p>

      <nav className="min-h-0 flex-1 overflow-y-auto pb-4">
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `mx-3 mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                isActive
                  ? 'border border-cred-gold/30 bg-cred-gold/10 font-semibold text-cred-gold shadow-cred-gold'
                  : 'border border-transparent text-cred-text-secondary hover:bg-cred-elevated hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cred-gold" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-cred-border p-4">
        <div className="mb-3 rounded-xl border border-cred-border bg-cred-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient font-bold text-black">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || 'PayVault user'}
              </p>
              <p className="truncate text-xs text-cred-text-muted">
                {user?.role || fallbackRole}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-cred-text-muted transition hover:bg-cred-elevated hover:text-cred-red"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cred-black">
      {/* desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-cred-border bg-cred-dark lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[17rem] max-w-[85vw] animate-slide-in border-r border-cred-border bg-cred-dark shadow-cred-elevated">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:ml-72">
        <div className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-cred-border bg-cred-black/80 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cred-border bg-cred-elevated text-cred-text-secondary transition hover:border-cred-gold hover:text-cred-gold lg:hidden"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg lg:text-xl">
              {pageTitle}
            </h1>
          </div>
          {topBarRight}
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
