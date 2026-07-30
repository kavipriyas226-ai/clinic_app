import { Menu, Bell, Search, LogOut, ChevronDown, AlertTriangle, CheckCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from '../../api/notifications.js'
import { logout } from '../../api/auth.js'

const currentUser = { name: 'Devsclinic', avatarInitials: 'DC' }

const POLL_INTERVAL_MS = 8000

function timeAgo(isoString) {
  if (!isoString) return ''
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    navigate(trimmed ? `/patients?search=${encodeURIComponent(trimmed)}` : '/patients')
  }

  function refreshNotifications() {
    getNotifications().then(setNotifications).catch(() => {})
    getUnreadNotificationCount().then(setUnreadCount).catch(() => {})
  }

  useEffect(() => {
    refreshNotifications()
    const interval = setInterval(refreshNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  async function handleNotificationClick(notification) {
    setNotifOpen(false)
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // ignore — next poll will resync
      }
    }
    if (notification.type === 'LOW_STOCK') {
      navigate('/inventory')
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore — next poll will resync
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-primary-100/70 flex items-center justify-between px-4 sm:px-6 gap-4 print:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition lg:hidden"
        >
          <Menu size={20} />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-card border border-gray-100 py-2 z-20">
                <div className="px-4 py-1.5 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-primary-50/40 transition ${
                          !notification.read ? 'bg-primary-50/60' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{notification.itemName}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

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
                    logout()
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
