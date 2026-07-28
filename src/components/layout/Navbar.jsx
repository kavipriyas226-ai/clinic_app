import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../../data/mockData.js'

export default function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-primary-100/70 flex items-center justify-between px-4 sm:px-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, invoices..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-primary-50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-gray-700">{currentUser.name}</p>
              <p className="text-[11px] text-gray-400">{currentUser.role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-gray-100 py-1.5 z-20">
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/login')
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
