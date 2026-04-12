"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart3,
  Users,
  Settings,
  FileText,
  LayoutDashboard,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
  Target,
  Lock,
  Image as ImageIcon
} from "lucide-react"

interface CollapsibleSidebarProps {
  userName?: string
  userRole?: string
  userInitial?: string
}

export default function CollapsibleSidebar({ 
  userName = "Admin",
  userRole = "ADMIN",
  userInitial = "A"
}: CollapsibleSidebarProps) {
  // Initialize state to false (same on server and client to avoid hydration mismatch)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Load state from localStorage after hydration (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("admin-sidebar-collapsed")
      if (savedState !== null) {
        setIsCollapsed(savedState === "true")
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-sidebar-collapsed", isCollapsed.toString())
    }
  }, [isCollapsed])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    
    // Dispatch custom event for other components to listen to
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sidebar-toggle", {
          detail: { isCollapsed: newState }
        })
      )
    }
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, adminOnly: true },
    { label: "Content CMS", href: "/admin/cms", icon: FileText },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Predictions", href: "/admin/predictions", icon: Target },
    { label: "User Management", href: "/admin/users", icon: Users, adminOnly: true },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, adminOnly: true },
    { label: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
  ]

  // Sidebar width classes
  const sidebarWidth = isCollapsed ? "w-16" : "w-64"
  const contentMargin = isCollapsed ? "lg:ml-16" : "lg:ml-64"

  return (
    <>
      {/* Mobile Toggle Button (only visible on small screens) */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-[#2D3748] text-gray-700 dark:text-white"
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          fixed top-16 bottom-0 left-0 
          ${sidebarWidth}
          bg-white dark:bg-[#1A1F2E] border-r border-gray-200 dark:border-[#2D3748] z-40 
          hidden lg:flex lg:flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with Toggle Button */}
          <div className="px-6 py-8 flex items-center justify-between">
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D6E6E] mb-1 whitespace-nowrap">
                Admin Portal
              </h2>
              <div className="h-px w-8 bg-[#0D6E6E] opacity-30"></div>
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const isLocked = item.adminOnly && userRole !== "ADMIN"
              
              if (isLocked) {
                return (
                  <div 
                    key={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl 
                      transition-all relative overflow-hidden group
                      opacity-40 cursor-not-allowed bg-transparent
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? `${item.label} (Locked)` : "LOCKED"}
                  >
                    <div className="absolute inset-y-2 left-0 w-1 bg-slate-600 rounded-full scale-y-0 transition-transform duration-200"></div>
                    <item.icon className="w-5 h-5 opacity-50 flex-shrink-0 text-slate-500" />
                    
                    <span className={`
                      text-sm font-medium transition-all duration-300 text-slate-500
                      ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                    `}>
                      {item.label}
                    </span>
                    
                    {!isCollapsed && (
                      <Lock className="ml-auto w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </div>
                )
              }

              return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl 
                  hover:bg-white/5 transition-all 
                  text-slate-400 hover:text-white 
                  group relative overflow-hidden
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="absolute inset-y-2 left-0 w-1 bg-[#0D6E6E] rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-200"></div>
                <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                
                {/* Label - hidden when collapsed */}
                <span className={`
                  text-sm font-medium transition-all duration-300
                  ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                `}>
                  {item.label}
                </span>
                
                {/* Chevron - hidden when collapsed */}
                <ChevronRight className={`
                  ml-auto w-4 h-4 opacity-20 group-hover:opacity-60 transition-opacity flex-shrink-0
                  ${isCollapsed ? 'hidden' : ''}
                `} />
              </Link>
            )})}
          </nav>

          {/* User Profile / Exit Control */}
          <div className="p-4 border-t border-gray-200 dark:border-[#2D3748]">
            <div className={`
              flex items-center gap-3 px-4 py-4 mb-2 
              bg-white/5 rounded-2xl border border-white/5
              ${isCollapsed ? 'justify-center' : ''}
            `}>
              <div className="w-8 h-8 rounded-full bg-[#0D6E6E] flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0">
                {userInitial}
              </div>
              
              {/* User Info - hidden when collapsed */}
              <div className={`
                overflow-hidden transition-all duration-300
                ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
              `}>
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-tight">{userRole}</p>
              </div>
            </div>
            
            <Link 
              href="/"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl 
                hover:bg-red-500/10 text-slate-400 hover:text-red-400 
                transition-all font-medium text-sm group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? "Back to Site" : undefined}
            >
              <ArrowLeft className={`
                w-4 h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0
                ${isCollapsed ? 'm-0' : ''}
              `} />
              
              {/* Label - hidden when collapsed */}
              <span className={`
                transition-all duration-300
                ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
              `}>
                Back to Site
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`
          lg:hidden fixed top-16 bottom-0 left-0 w-64
          bg-white dark:bg-[#1A1F2E] border-r border-gray-200 dark:border-[#2D3748] z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="px-6 py-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D6E6E] mb-1">
              Admin Portal
            </h2>
            <div className="h-px w-8 bg-[#0D6E6E] opacity-30"></div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white group relative overflow-hidden"
                onClick={toggleMobileSidebar}
              >
                <div className="absolute inset-y-2 left-0 w-1 bg-[#0D6E6E] rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-200"></div>
                <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight className="ml-auto w-4 h-4 opacity-20 group-hover:opacity-60 transition-opacity" />
              </Link>
            ))}
          </nav>

          {/* Mobile User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-[#2D3748]">
            <div className="flex items-center gap-3 px-4 py-4 mb-2 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#0D6E6E] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-tight">{userRole}</p>
              </div>
            </div>
            
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all font-medium text-sm group"
              onClick={toggleMobileSidebar}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Content margin class for global use */}
      <style jsx global>{`
        .sidebar-expanded {
          width: 16rem; /* 256px */
        }
        .sidebar-collapsed {
          width: 4rem; /* 64px */
        }
        .content-margin-expanded {
          margin-left: 16rem;
        }
        .content-margin-collapsed {
          margin-left: 4rem;
        }
      `}</style>
    </>
  )
}