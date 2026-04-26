import { NavLink, useLocation } from 'react-router-dom'
import { Home, PlusCircle, ChefHat, Heart, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

const navItems = [
  { to: '/',         icon: Home,       label: '冷蔵庫' },
  { to: '/add',      icon: PlusCircle, label: '食材追加' },
  { to: '/recipe',   icon: ChefHat,    label: 'レシピ' },
  { to: '/favorites',icon: Heart,      label: 'お気に入り' },
  { to: '/settings', icon: Settings,   label: '設定' },
]

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-2xl">🧊</div>
          <div>
            <h1 className="text-lg font-bold text-sky-700 leading-tight">フリッジ管理</h1>
            <p className="text-xs text-gray-400">冷蔵庫の食材を賢く管理</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto flex">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                  isActive
                    ? 'text-sky-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-sky-600' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={`font-medium ${isActive ? 'text-sky-600' : ''}`}>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-sky-500 rounded-full" />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
