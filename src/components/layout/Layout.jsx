import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
<<<<<<< HEAD
    <div className="flex h-screen overflow-hidden bg-bg print:block print:h-auto print:overflow-visible print:bg-white">
=======
    <div className="flex min-h-screen bg-bg">
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
<<<<<<< HEAD
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 max-w-[1600px] w-full mx-auto [scrollbar-gutter:stable] print:overflow-visible print:p-0 print:max-w-none">
=======
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
          <Outlet />
        </main>
      </div>
    </div>
  )
}
