'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

import { Button } from '~/components/ui/button'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const toggle = () => {
    const next = locale === 'en' ? 'vi' : 'en'
    // Replace the locale segment: /en/admin/lessons → /vi/admin/lessons
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="font-medium">
      {locale === 'en' ? 'VI' : 'EN'}
    </Button>
  )
}
