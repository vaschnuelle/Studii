import { Home, Timer, TrendingUp, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
] as const;

/**
 * Main app frame: gradient backdrop, glass header, desktop nav, and mobile tab bar (Figma reference).
 */
export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100">
      <div
        className="pointer-events-none fixed left-10 top-20 h-96 w-96 rounded-full bg-[#508CA4]/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-20 right-10 h-96 w-96 rounded-full bg-amber-300/30 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22223B]/5 blur-[150px]"
        aria-hidden
      />

      <header className="relative z-10 border-b-2 border-white/80 bg-white/60 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 shadow-lg shadow-[#508CA4]/30 transition-transform group-hover:scale-105">
              <span className="text-2xl" aria-hidden>
                📚
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#22223B]">Studii</p>
              <p className="text-xs font-semibold text-[#22223B]/60">Stay focused together</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }: { isActive: boolean }) =>
                    [
                      'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 text-white shadow-lg shadow-[#508CA4]/30'
                        : 'text-[#22223B]/70 hover:bg-white/80 hover:text-[#22223B]',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-[#22223B]">You</p>
              <p className="text-xs text-[#22223B]/60">12.5h this week</p>
            </div>
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 shadow-lg ring-2 ring-white/80">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt=""
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-white/90 bg-white/80 shadow-2xl backdrop-blur-md md:hidden"
        aria-label="Primary mobile"
      >
        <div className="grid grid-cols-4 gap-1 px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  [
                    'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 text-white shadow-lg'
                      : 'text-[#22223B]/60',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-xs font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
