'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    trackEvent('page_view', {
      page: pathname,
    })
  }, [pathname])

  return null
}