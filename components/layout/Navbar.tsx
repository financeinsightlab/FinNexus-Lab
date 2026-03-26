'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import GlobalSearch from '@/components/layout/GlobalSearch';
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: 'Research', href: '/research' },
  { label: 'Insights', href: '/insights' },
  { label: 'Tools', href: '/tools' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Tracker', href: '/tracker' },


];

function ThemeToggle({ inverted }: { inverted?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /** Runs after the placeholder button commits (avoids SSR/client markup mismatch). Safe with Strict Mode remounts. */
  const afterHydrateRef = useCallback((el: HTMLButtonElement | null) => {
    if (el) queueMicrotask(() => setMounted(true));
  }, []);

  const buttonClass = `min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl transition-colors focus-ring ${
    inverted
      ? 'text-white hover:bg-white/15 active:bg-white/25'
      : 'text-brand-navy hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

  // Same button shell on server + first client paint — avoids hydration mismatch (see next-themes docs).
  if (!mounted) {
    return (
      <button
        ref={afterHydrateRef}
        type="button"
        className={buttonClass}
        aria-label="Toggle theme"
        disabled
        aria-busy="true"
      >
        <span className="h-5 w-5 rounded-full border-2 border-current opacity-35" aria-hidden />
      </button>
    );
  }

  return (
    <button
      ref={afterHydrateRef}
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={buttonClass}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${inverted ? 'text-white' : 'text-brand-slate'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

/** Single-path magnifier (reads as one icon, not icon + separate mark) */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.2-5.2m2.2-5.3a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSolid, setIsSolid] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsSolid(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isHome = pathname === '/';
  /** Transparent “hero” bar: only on home before scroll — logo uses light treatment */
  const isHeroTransparent = isHome && !isSolid;

  const headerClasses = [
    'fixed top-0 inset-x-0 z-50 transition-all duration-300',
    isSolid
      ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
      : 'bg-transparent border-b border-transparent',
    isHeroTransparent ? 'text-white' : 'text-brand-navy',
  ].join(' ');

  const linkClasses = (href: string) => {
    const base = 'px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] inline-flex items-center';
    if (isActive(href)) return `${base} text-brand-teal bg-teal-50 dark:bg-teal-950/40`;
    if (isSolid) return `${base} text-brand-slate hover:text-brand-navy hover:bg-gray-50 dark:hover:bg-gray-800`;
    return `${base} text-white/90 hover:text-white hover:bg-white/10`;
  };

  const mobileLinkClasses = (href: string) => {
    const base = 'block px-4 py-3.5 text-base font-medium transition-colors min-h-[48px] flex items-center rounded-xl';
    if (isActive(href)) return `${base} text-brand-teal bg-teal-50`;
    return `${base} text-brand-slate hover:bg-gray-50 active:bg-gray-100`;
  };

  /* Fixed width + no ⌘K badge at xl → stops layout “jump” on resize. Icon + label only. */
  const searchBtnDesktopClass = isHeroTransparent
    ? 'hidden md:inline-flex shrink-0 items-center justify-center gap-2 h-10 w-[118px] rounded-full text-sm font-semibold text-white bg-white/20 border border-white/35 backdrop-blur-sm hover:bg-white/30 transition-colors duration-150 focus-ring'
    : 'hidden md:inline-flex shrink-0 items-center justify-center gap-2 h-10 w-[118px] rounded-full text-sm font-semibold text-brand-navy bg-white border border-gray-200 shadow-sm hover:border-brand-teal hover:text-brand-teal dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:border-brand-teal transition-colors duration-150 focus-ring';

  const searchBtnMobileClass = isHeroTransparent
    ? 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-white bg-white/15 border border-white/25 backdrop-blur-md hover:bg-white/25 transition-colors duration-150 focus-ring'
    : 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-white bg-brand-navy shadow-md hover:bg-brand-teal transition-colors duration-150 focus-ring';

  return (
    <>
      <header className={headerClasses}>
        <nav className="wrap flex items-center justify-between gap-2 h-16 md:h-[4.25rem]">
          <Link
            href="/"
            className="group relative flex shrink-0 items-baseline gap-1 sm:gap-1.5 -ml-0.5 py-1 pr-1 focus-ring rounded-md outline-offset-4"
            aria-label="FinNexus Lab home"
          >
            <span
              className={`font-extrabold tracking-tight text-base sm:text-lg md:text-xl transition-colors duration-200 ${
                isHeroTransparent
                  ? 'text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]'
                  : 'text-brand-navy group-hover:text-brand-teal'
              }`}
            >
              FinNexus
            </span>
            <span
              className={`font-semibold tracking-tight text-base sm:text-lg md:text-xl transition-colors duration-200 ${
                isHeroTransparent
                  ? 'text-[#E8C96A] [text-shadow:0_2px_10px_rgba(0,0,0,0.4)]'
                  : 'text-brand-teal group-hover:text-brand-gold'
              }`}
            >
              Lab
            </span>
            <span
              className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-brand-teal to-brand-gold transition-[width] duration-300 ease-out group-hover:w-full opacity-0 group-hover:opacity-100"
              aria-hidden
            />
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-center max-w-3xl mx-2 gap-0.5 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClasses(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex lg:hidden items-center gap-1">
            {navLinks.slice(0, 4).map((link) => (
              <Link key={link.href} href={link.href} className={linkClasses(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={openSearch}
              className={searchBtnDesktopClass}
              aria-label="Open search"
              title="Search — Ctrl+K or ⌘K"
            >
              <SearchIcon className="shrink-0 pointer-events-none" />
              <span className="whitespace-nowrap leading-none">Search</span>
            </button>

            <button
              type="button"
              onClick={openSearch}
              className={`md:hidden ${searchBtnMobileClass}`}
              aria-label="Open search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-2">
  {/* Resume */}
  <Link
    href="/resume"
    className={`text-sm font-medium transition-colors min-h-[44px] inline-flex items-center px-2 rounded-lg focus-ring ${
      isHeroTransparent
        ? 'text-white/90 hover:text-white hover:bg-white/10'
        : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    Resume
  </Link>

  <ThemeToggle inverted={isHeroTransparent} />

  {/* 🔥 AUTH SECTION */}
  {!session ? (
    <Link
      href="/auth/signin"
      className="btn btn-primary whitespace-nowrap min-h-[44px]"
    >
      Login
    </Link>
  ) : (
    <>
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-lg border border-[#0D6E6E] text-sm"
      >
        Dashboard
      </Link>

      <button
        onClick={() => signOut()}
        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm"
      >
        Logout
      </button>
    </>
  )}

  <Link href="/contact" className="btn btn-primary whitespace-nowrap min-h-[44px]">
    Work With Me
  </Link>
</div>

            <div className="md:hidden flex items-center gap-0.5">
              <ThemeToggle inverted={isHeroTransparent} />

              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={`min-h-[44px] min-w-[44px] inline-flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-colors focus-ring ${
                  isHeroTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                <span
                  className={`block h-0.5 w-6 rounded-full transition-all duration-300 origin-center ${
                    isHeroTransparent ? 'bg-white' : 'bg-brand-navy dark:bg-gray-200'
                  } ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                />
                <span
                  className={`block h-0.5 w-6 rounded-full transition-all duration-300 ${
                    isHeroTransparent ? 'bg-white' : 'bg-brand-navy dark:bg-gray-200'
                  } ${isOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`block h-0.5 w-6 rounded-full transition-all duration-300 origin-center ${
                    isHeroTransparent ? 'bg-white' : 'bg-brand-navy dark:bg-gray-200'
                  } ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                />
              </button>
            </div>
          </div>
        </nav>

        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
            isOpen ? 'max-h-[min(85vh,640px)] border-t border-gray-100 dark:border-gray-800 shadow-lg' : 'max-h-0'
          } bg-white dark:bg-gray-950`}
        >
          <div className="p-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-1 max-h-[min(80vh,600px)] overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-3 w-full min-h-[52px] px-4 rounded-xl bg-brand-navy text-white font-semibold text-left hover:bg-brand-teal transition-colors focus-ring"
            >
              <SearchIcon className="shrink-0" />
              <span>Search library</span>
              <span className="ml-auto text-xs font-mono opacity-80">⌘K</span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClasses(link.href)}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/resume"
              className="block px-4 py-3.5 text-base font-medium text-brand-slate min-h-[48px] flex items-center rounded-xl hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Resume
            </Link>

            <Link
              href="/contact"
              className="btn btn-primary mt-2 min-h-[52px] text-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              Work With Me
            </Link>
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
