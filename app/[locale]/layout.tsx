import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Suspense } from 'react'

import { Providers } from '~/providers'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <ClerkProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </NextIntlClientProvider>
    </ClerkProvider>
  )
}
