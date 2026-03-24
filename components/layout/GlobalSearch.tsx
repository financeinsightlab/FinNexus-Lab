'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Configure, Hits, InstantSearch, SearchBox } from 'react-instantsearch';
import { algoliasearch } from 'algoliasearch';

type AlgoliaHit = {
  objectID: string;
  type?: string;
  title?: string;
  summary?: string;
  thesis?: string;
  url?: string;
  sector?: string;
  category?: string;
};

function useVisualViewport(active: boolean) {
  const [box, setBox] = useState({ height: 0, offsetTop: 0 });

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const update = () => {
      const vv = window.visualViewport;
      if (vv) {
        setBox({ height: vv.height, offsetTop: vv.offsetTop });
      } else {
        setBox({ height: window.innerHeight, offsetTop: 0 });
      }
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [active]);

  return box;
}

/** Desktop-only autofocus for search (avoids mobile keyboard covering the sheet). */
function useDesktopMediaQuery() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => false
  );
}

function SearchSubmitIcon({ classNames }: { classNames: { submitIcon?: string } }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={classNames.submitIcon ?? ''}
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="18" r="8" />
      <path d="M26 26 L36 36" />
    </svg>
  );
}

function ResetIcon({ classNames }: { classNames: { resetIcon?: string } }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={classNames.resetIcon ?? ''}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4 L16 16" />
      <path d="M16 4 L4 16" />
    </svg>
  );
}

function CompactHit({ hit, onPick }: { hit: AlgoliaHit; onPick: () => void }) {
  const url = hit.url ?? '/';
  const title = hit.title ?? 'Untitled';
  const subtitle =
    hit.type === 'research'
      ? hit.summary
      : hit.type === 'insight'
        ? hit.thesis
        : '';
  const badge =
    hit.type === 'research'
      ? hit.sector ?? 'Research'
      : hit.type === 'insight'
        ? hit.category ?? 'Insight'
        : hit.type ?? 'Content';

  return (
    <Link
      href={url}
      onClick={onPick}
      className="flex min-h-[44px] min-w-0 max-w-full flex-col justify-center gap-1 border-b border-gray-100 px-3 py-3 text-left last:border-b-0 hover:bg-brand-silver/60 active:bg-brand-silver sm:px-4"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={`max-w-full shrink-0 truncate rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            hit.type === 'insight' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
          }`}
        >
          {badge}
        </span>
        <span className="shrink-0 text-xs text-gray-400">{hit.type === 'insight' ? 'Insight' : 'Research'}</span>
      </div>
      <span className="line-clamp-2 break-words font-semibold text-brand-navy">{title}</span>
      {subtitle ? <span className="line-clamp-2 text-sm text-brand-slate">{subtitle}</span> : null}
    </Link>
  );
}

type GlobalSearchProps = {
  open: boolean;
  onClose: () => void;
};

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const desktopAutofocus = useDesktopMediaQuery();

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;

  const searchClient = useMemo(() => {
    if (!appId || !searchKey) return null;
    return algoliasearch(appId, searchKey);
  }, [appId, searchKey]);

  const { height: vvHeight, offsetTop: vvTop } = useVisualViewport(open);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleEscape]);

  const overlayHeight = vvHeight > 0 ? vvHeight : typeof window !== 'undefined' ? window.innerHeight : 0;
  const overlayTop = vvTop;

  const panelMaxHeightPx = useMemo(() => {
    if (!open) return 720;
    const h = vvHeight > 0 ? vvHeight : typeof window !== 'undefined' ? window.innerHeight : 720;
    return Math.min(Math.max(h - 20, 280), 720);
  }, [open, vvHeight]);

  if (!open) return null;

  const backdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const panelStyle = { maxHeight: panelMaxHeightPx } as const;

  const fallbackContent = (
    <div
      ref={panelRef}
      className="w-full min-w-0 max-w-lg shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-6"
      style={panelStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="mb-2 font-semibold text-brand-navy">Search unavailable</p>
      <p className="mb-4 text-sm text-brand-slate">
        Add <code className="rounded bg-gray-100 px-1 text-xs">NEXT_PUBLIC_ALGOLIA_SEARCH_KEY</code> to enable search.
      </p>
      <div className="flex gap-2">
        <Link href="/research" className="btn btn-primary flex-1 text-center" onClick={onClose}>
          Browse research
        </Link>
        <button type="button" className="btn btn-outline flex-1" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );

  const searchContent = (
    <div
      ref={panelRef}
      className="flex min-h-0 w-full min-w-0 max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:max-h-[min(90vh,720px)]"
      style={panelStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-brand-navy to-brand-slate px-3 py-3 sm:gap-3 sm:px-4">
        <h2
          id="global-search-title"
          className="min-w-0 truncate text-sm font-bold tracking-wide text-white"
        >
          Search FinNexus Lab
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 focus-ring"
          aria-label="Close search"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <InstantSearch searchClient={searchClient!} indexName="finnexus_content">
        <div className="flex min-h-0 flex-1 flex-col">
          <Configure hitsPerPage={8} />
          <div className="min-w-0 shrink-0 border-b border-gray-100 p-3 sm:p-4">
            <SearchBox
              placeholder="Search reports, insights, topics…"
              autoFocus={desktopAutofocus}
              classNames={{
                form: 'relative flex min-w-0 items-center',
                input:
                  'box-border w-full min-w-0 max-w-full rounded-xl border-2 border-gray-200 py-3 pl-3 pr-[4.5rem] text-base text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30 sm:pl-4 sm:pr-24',
                submit:
                  'absolute right-10 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-brand-teal hover:bg-teal-50 sm:right-12 sm:p-2',
                submitIcon: '',
                reset:
                  'absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 sm:right-3 sm:p-2',
                resetIcon: '',
                loadingIndicator: 'hidden',
                root: 'w-full',
                loadingIcon: 'hidden',
              }}
              submitIconComponent={SearchSubmitIcon}
              resetIconComponent={ResetIcon}
              inputProps={{
                enterKeyHint: 'search',
                autoComplete: 'off',
                autoCorrect: 'off',
                autoCapitalize: 'none',
              }}
            />
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
            <Hits
              hitComponent={({ hit }) => <CompactHit hit={hit as AlgoliaHit} onPick={onClose} />}
              classNames={{
                root: 'min-h-[200px]',
                emptyRoot: 'flex min-h-[200px] items-center justify-center px-4 py-12 text-center text-sm text-brand-slate',
                list: 'flex flex-col',
                item: 'list-none',
                bannerRoot: '',
                bannerImage: '',
                bannerLink: '',
              }}
            />
          </div>

          <div className="min-w-0 shrink-0 border-t border-gray-100 bg-gray-50 p-3 sm:p-4">
            <Link
              href="/research"
              onClick={onClose}
              className="focus-ring flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-brand-navy px-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:bg-brand-teal"
            >
              <span className="min-w-0 flex-1 text-pretty sm:flex-none">Open full research search</span>
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </InstantSearch>
    </div>
  );

  return (
    <div
      className="fixed inset-x-0 z-[60] flex max-h-[100dvh] min-h-0 flex-col overflow-x-hidden bg-black/50 backdrop-blur-[1px]"
      style={{
        top: overlayTop,
        height: overlayHeight > 0 ? overlayHeight : '100dvh',
        // Prevent horizontal bleed on notched devices / browser chrome
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
      role="presentation"
    >
      <div
        className="box-border flex min-h-0 min-w-0 flex-1 flex-col justify-start overflow-y-auto overflow-x-hidden px-3 py-2 sm:justify-center sm:px-4 sm:py-6"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
        onMouseDown={backdropClick}
      >
        {!searchClient ? fallbackContent : searchContent}
      </div>
    </div>
  );
}
