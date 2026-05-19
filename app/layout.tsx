import { Inter, JetBrains_Mono } from 'next/font/google'

import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://voca-ai-rust.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Voca AI | Learn Vocabulary Faster With Smart Review',
    template: '%s | Voca AI',
  },
  description:
    'Voca AI helps learners build vocabulary, practice pronunciation, review with spaced repetition, and track real mastery over time.',
  applicationName: 'Voca AI',
  keywords: [
    'Voca AI',
    'vocabulary learning',
    'learn English vocabulary',
    'spaced repetition',
    'pronunciation practice',
    'vocabulary review',
    'AI language learning',
    'English learning app',
    'flashcards',
  ],
  authors: [{ name: 'Voca AI' }],
  creator: 'Voca AI',
  publisher: 'Voca AI',
  category: 'education',
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      vi: '/vi',
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Voca AI',
    title: 'Voca AI | Learn Vocabulary Faster With Smart Review',
    description:
      'Build vocabulary, practice pronunciation, review at the right time, and see what you have truly mastered.',
    locale: 'en_US',
    alternateLocale: ['vi_VN'],
  },
  twitter: {
    card: 'summary',
    title: 'Voca AI | Learn Vocabulary Faster With Smart Review',
    description:
      'Build vocabulary, practice pronunciation, and review smarter with Voca AI.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before hydration to prevent flash of wrong theme */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
