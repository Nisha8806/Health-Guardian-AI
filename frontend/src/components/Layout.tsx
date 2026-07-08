import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../lib/api';
import {
  LayoutDashboard,
  FileScan,
  Users,
  Pill,
  CalendarCheck,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/prescription-scanner', icon: FileScan, label: 'Prescription Scanner' },
  { to: '/family-health', icon: Users, label: 'Family Health' },
  { to: '/medicine-reminder', icon: Pill, label: 'Medicine Reminder' },
  { to: '/health-checkup', icon: CalendarCheck, label: 'Health Checkup' },
  { to: '/ai-chatbot', icon: MessageCircle, label: 'AI Chatbot' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-sky-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-sky-900" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            <span className="font-bold text-sky-900 tracking-tight">Health Guardian AI</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-sky-100 shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-sky-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sky-900 tracking-tight">Health Guardian</h1>
                <p className="text-xs text-sky-500 font-medium">AI-Powered Healthcare</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-sky-100 transition-colors"
            >
              <X className="w-5 h-5 text-sky-600" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={fileUrl(profile.avatar_url)} alt={profile.full_name || ''} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{profile?.full_name || 'Welcome!'}</p>
              <p className="text-xs text-sky-100">{user?.email || 'Manage your health'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200'
                    : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sky-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
