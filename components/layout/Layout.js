// components/layout/Layout.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../firebase/auth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Leaf, Trophy, Brain, BarChart3,
  Camera, Users, LogOut, Settings, ChevronRight, Zap
} from 'lucide-react';

const studentNav = [
  { href: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scan', icon: Camera, label: 'Skann mat' },
  { href: '/leaderboard', icon: Trophy, label: 'Rangering' },
  { href: '/quiz', icon: Brain, label: 'Quiz' },
  { href: '/stats', icon: BarChart3, label: 'Statistikk' },
];

const teacherNav = [
  { href: '/dashboard/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leaderboard', icon: Trophy, label: 'Rangering' },
  { href: '/stats', icon: BarChart3, label: 'Statistikk' },
  { href: '/dashboard/classes', icon: Users, label: 'Klasser' },
];

export default function Layout({ children }) {
  const { userData } = useAuth();
  const router = useRouter();
  const nav = userData?.role === 'teacher' ? teacherNav : studentNav;

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logget ut!');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-bio-gradient">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full border-r border-bio-border bg-dark-900/80 backdrop-blur-xl z-40">
        {/* Logo */}
        <div className="p-6 border-b border-bio-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center bio-glow">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display font-800 text-white text-lg leading-tight">BioBin X</div>
              <div className="text-bio-400 text-xs font-mono">v2.0</div>
            </div>
          </Link>
        </div>

        {/* User info */}
        {userData && (
          <div className="px-4 py-4 border-b border-bio-border">
            <div className="bio-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bio-600 to-moss-700 flex items-center justify-center text-white font-display font-700 text-sm">
                {userData.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-display font-600 truncate">{userData.name}</div>
                <div className="text-bio-400 text-xs capitalize">{userData.role === 'teacher' ? 'Lærer' : 'Elev'}</div>
              </div>
              {userData.role === 'student' && (
                <div className="text-right">
                  <div className="text-bio-400 text-xs font-mono">{userData.points || 0}p</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, icon: Icon, label }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-500 transition-all duration-200 group ${
                  isActive
                    ? 'bg-bio-500/10 text-bio-400 border border-bio-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/4'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-bio-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-bio-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-bio-border space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/8 transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            Logg ut
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 mobile-nav z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {nav.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-bio-400' : 'text-slate-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-body">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
