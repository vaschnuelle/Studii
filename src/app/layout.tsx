import { Outlet, Link, useLocation } from 'react-router';
import { Home, Timer, Users, TrendingUp, Sparkles, CircleDashed } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function Layout() {
  const location = useLocation();
  const { currentUser, signout } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/timer', label: 'Timer', icon: Timer },
    { path: '/pomodoro', label: 'Pomodoro', icon: CircleDashed },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/wrapped', label: 'Wrapped', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-[#508CA4]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-amber-300/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#22223B]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/60 backdrop-blur-md border-b-2 border-white/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#22223B]">Studii</h1>
              <p className="text-xs text-[#22223B]/60 font-semibold">Stay focused together</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-wrap justify-end max-w-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 text-white shadow-lg shadow-[#508CA4]/30'
                      : 'text-[#22223B]/70 hover:bg-white/80 hover:text-[#22223B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#22223B]">{currentUser?.email ?? "Guest"}</p>
              <p className="text-xs text-[#22223B]/60">
                {currentUser ? "Supabase account active" : "Sign up to sync sessions"}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-2xl overflow-hidden ring-2 ring-white/80 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {currentUser ? (
              <button
                onClick={() => void signout()}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/70 text-[#22223B] border border-white/80"
              >
                Sign out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white/70 text-[#22223B] border border-white/80"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#508CA4] text-white border border-[#508CA4]/40"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-white/90 shadow-2xl z-50">
        <div className="grid grid-cols-6 gap-0.5 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all ${
                  active
                    ? 'bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 text-white shadow-lg'
                    : 'text-[#22223B]/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] sm:text-xs font-bold leading-tight text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
