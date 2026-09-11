import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UtensilsCrossed, Dumbbell, Brain,
  BarChart2, User, Flame, Trophy, Menu, X, Zap,
  LogOut, ChevronRight, ClipboardList, CalendarCheck,
  Camera, Type, ShoppingCart
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/daily-log',         icon: ClipboardList,   label: 'Daily Log'      },
  { to: '/meals',             icon: UtensilsCrossed, label: 'Meals'          },
  { to: '/meals/my-plan',     icon: CalendarCheck,   label: 'My Meal Plan'   },
  { to: '/workouts',          icon: Dumbbell,        label: 'Workouts'       },

  { label: 'AI TOOLS', divider: true },
  { to: '/ai/coach',          icon: Brain,           label: 'AI Coach'       },
  { to: '/ai/snap',           icon: Camera,          label: 'Snap Meal'      },
  { to: '/ai/text-analyzer',  icon: Type,            label: 'Text Analyzer'  },
  { to: '/ai/planner',        icon: Zap,             label: 'Meal Planner'   },
  { to: '/ai/grocery',        icon: ShoppingCart,    label: 'Grocery List'   },

  { label: 'PROGRESS', divider: true },
  { to: '/analytics',         icon: BarChart2,       label: 'Analytics'      },
  { to: '/streaks',           icon: Flame,           label: 'Streaks'        },
  { to: '/badges',            icon: Trophy,          label: 'Badges'         },
  { to: '/profile',           icon: User,            label: 'Profile'        },
]

function SidebarLink({ item, collapsed, onClick }) {
  if (item.divider) {
    if (collapsed) return <div className="my-2 border-t border-[#1a1a1a]" />
    return (
      <p className="px-3 mt-5 mb-1.5 text-[9px] font-condensed tracking-[0.2em]
        text-[#2a2a2a] uppercase select-none">
        {item.label}
      </p>
    )
  }
  return (
    <NavLink to={item.to} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
        ${isActive
          ? 'bg-[#f5c518] text-black'
          : 'text-[#6b7280] hover:bg-[#111] hover:text-[#e5e5e5]'}`
      }>
      {({ isActive }) => (
        <>
          <item.icon size={17} className={isActive ? 'text-black' : ''} />
          {!collapsed && (
            <span className="font-condensed font-semibold text-sm tracking-wide truncate flex-1">
              {item.label}
            </span>
          )}
          {!collapsed && !isActive && (
            <ChevronRight size={12}
              className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout }            = useAuthStore()
  const navigate                    = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col bg-[#0d0d0d] border-r border-[#1a1a1a] h-full
      transition-all duration-300 overflow-hidden
      ${mobile ? 'w-72' : (collapsed ? 'w-[60px]' : 'w-60')}
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#1a1a1a] shrink-0
        ${collapsed && !mobile ? 'justify-center px-2' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#f5c518] flex items-center
          justify-center shrink-0">
          <Zap size={17} className="text-black" fill="black" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-display text-xl text-white">NUTRIFIT</span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-[#3a3a3a] hover:text-[#6b7280] transition-colors p-1">
            <Menu size={16} />
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)}
            className="ml-auto text-[#3a3a3a] hover:text-[#6b7280] p-1">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-none">
        {NAV.map((item, i) => (
          <SidebarLink
            key={i} item={item}
            collapsed={collapsed && !mobile}
            onClick={() => mobile && setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* User row */}
      <div className={`p-2 border-t border-[#1a1a1a] shrink-0
        ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#f5c518] flex items-center
              justify-center text-black font-display text-sm shrink-0">
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-condensed font-bold text-[#e5e5e5] truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#3a3a3a] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors p-1 shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout}
            className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors p-2">
            <LogOut size={17} />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <Sidebar mobile />
          <div className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3
          border-b border-[#1a1a1a] bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#f5c518] flex items-center justify-center">
              <Zap size={14} className="text-black" fill="black" />
            </div>
            <span className="font-display text-lg text-white">NUTRIFIT</span>
          </div>
          <button onClick={() => setMobileOpen(true)}
            className="text-[#6b7280] hover:text-white p-1">
            <Menu size={22} />
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
