'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import GlobalSearch from '@/components/layout/GlobalSearch';
import { useSession, signOut } from 'next-auth/react';

/* ─────────────────────── NAV DATA ─────────────────────── */

const mainLinks = [
  { label: 'Research',  href: '/research',     icon: '📚' },
  { label: 'Insights',  href: '/insights',     icon: '💡' },
  { label: 'Data Lab',  href: '/data-lab',     icon: '🔬' },
  { label: 'Trackers',  href: '/tracker',      icon: '📊' },
  { label: 'Tools',     href: '/tools',        icon: '🛠️' },
];

const moreLinks = [
  { label: 'Services',     href: '/services',     icon: '🎯' },
  { label: 'About',        href: '/about',        icon: 'ℹ️' },
  { label: 'Podcast',      href: '/podcast',      icon: '🎙️' },
  { label: 'Case Studies', href: '/case-studies', icon: '📋' },
  { label: 'Pricing',      href: '/pricing',      icon: '💰' },
  { label: 'Enterprise',   href: '/enterprise',   icon: '🏢' },
  { label: 'Resume',       href: '/resume',       icon: '📄' },
];

const allLinks = [...mainLinks, ...moreLinks];

/* ─────────────────────── ICONS ─────────────────────── */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ─────────────────────── THEME TOGGLE ─────────────────────── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* ─────────────────────── LOGO ─────────────────────── */

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center group shrink-0">
      <span className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors duration-200">
        FinNexus<span className="text-teal-400">Lab</span>
      </span>
    </Link>
  );
}

/* ─────────────────────── MAIN NAVBAR ─────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session }           = useSession();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  /* Close more-dropdown on outside click */
  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-more-dropdown]')) setMoreOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [moreOpen]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinkClass = (href: string) =>
    `relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap group ${
      isActive(href)
        ? 'text-teal-400 bg-teal-500/10'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`;

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[200] bg-teal-500 text-white px-4 py-2 rounded-lg font-medium"
      >
        Skip to content
      </a>

      <header className="fixed top-0 inset-x-0 z-50 h-16 backdrop-blur-xl bg-black/75 border-b border-white/5 supports-[backdrop-filter]:bg-black/60">
        <nav className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <Logo />

          {/* ── DESKTOP NAV ── (hidden below lg) */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {mainLinks.map(link => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                <span className="text-sm opacity-75">{link.icon}</span>
                {link.label}
                {!isActive(link.href) && (
                  <span className="absolute inset-x-2 bottom-0.5 h-px bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                )}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" data-more-dropdown>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  moreLinks.some(l => isActive(l.href))
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown open={moreOpen} />
              </button>

              {moreOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-gray-900/98 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 z-50 anim-fade flex flex-col" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                  <div className="px-4 pt-3 pb-1 shrink-0">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">More Pages</p>
                  </div>
                  <div className="px-2 pb-1 overflow-y-auto no-scrollbar">
                    {moreLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors group/item ${
                          isActive(link.href) ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-sm opacity-70">{link.icon}</span>
                        <span className="flex-1">{link.label}</span>
                        <span className="text-gray-600 group-hover/item:text-teal-500 transition-colors text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                  {session && (
                    <div className="border-t border-gray-800 px-2 py-1.5 shrink-0">
                      <button
                        onClick={() => { setMoreOpen(false); signOut(); }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT CONTROLS ── */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium border border-transparent hover:border-gray-700 min-w-[40px] min-h-[40px] justify-center"
              aria-label="Search"
            >
              <SearchIcon />
              <span className="hidden xl:inline">Search</span>
            </button>

            {/* Theme */}
            <ThemeToggle />

            {/* Auth — desktop */}
            <div className="hidden lg:flex items-center gap-2 ml-1">
              {!session ? (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-200"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl border border-teal-500/50 text-teal-400 text-sm font-medium hover:bg-teal-500/10 hover:border-teal-500 transition-all"
                  >
                    Dashboard
                  </Link>
                  {(session.user as { role?: string })?.role === 'ADMIN' && (
                    <Link
                      href="/admin/users"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium shadow hover:opacity-90 transition"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/25 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* CTA — desktop only */}
            <Link
              href="/contact"
              className="hidden xl:flex items-center gap-2 ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-200 whitespace-nowrap"
            >
              <span>🚀</span>
              Work With Me
            </Link>

            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden relative ml-1 w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/10 text-white transition-all duration-200 active:scale-95"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ────────────────────────────────────────────────────────────
          MOBILE DRAWER  (slides in from right, below lg)
      ──────────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-[320px] max-w-[90vw] bg-gray-950 border-l border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-label="Mobile navigation"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <Logo onClick={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Search */}
            <div className="p-4">
              <button
                onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                <SearchIcon className="text-teal-400 shrink-0" />
                <span className="text-gray-300 text-sm">Search anything…</span>
                <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">⌘K</span>
              </button>
            </div>

            {/* Main nav */}
            <div className="px-4 pb-2">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2 px-1">Main</p>
              <div className="space-y-0.5">
                {mainLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="text-base w-6 text-center">{link.icon}</span>
                    {link.label}
                    {isActive(link.href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* More links */}
            <div className="px-4 pb-2 mt-4">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2 px-1">More</p>
              <div className="space-y-0.5">
                {moreLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="text-base w-6 text-center">{link.icon}</span>
                    {link.label}
                    {isActive(link.href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="px-4 pb-4 mt-4 border-t border-white/5 pt-4">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3 px-1">Account</p>
              {!session ? (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                >
                  <span>🔐</span>
                  Sign In / Sign Up
                </Link>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 py-3 bg-white/4 rounded-xl border border-white/6">
                    <p className="text-[11px] text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-2.5 border border-teal-500/40 text-teal-400 rounded-xl text-sm font-medium hover:bg-teal-500/10 transition-all">
                      Dashboard
                    </Link>
                    {(session.user as { role?: string })?.role === 'ADMIN' && (
                      <Link href="/admin/users" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                        Admin
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); signOut(); }}
                    className="w-full py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-4 pb-6">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.01] transition-all"
              >
                <span>🚀</span>
                Work With Me
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}