import { currentUser } from '@clerk/nextjs/server'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Check,
  Clock3,
  Flame,
  ImagePlus,
  Languages,
  Mic,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { AppLogo } from '~/components/layout/app-logo'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/cn'

import type { Metadata } from 'next'

type Locale = 'en' | 'vi'

type LandingCopy = {
  meta: {
    title: string
    description: string
  }
  nav: {
    features: string
    howItWorks: string
    signIn: string
    start: string
    dashboard: string
  }
  hero: {
    badge: string
    title: string
    highlight: string
    description: string
    primary: string
    secondary: string
    signedInPrimary: string
    trust: string[]
  }
  preview: {
    today: string
    title: string
    subtitle: string
    action: string
    stats: { label: string; value: string; tone: string }[]
    queue: { word: string; hint: string; due: string }[]
  }
  pains: {
    title: string
    items: { icon: typeof Clock3; title: string; body: string }[]
  }
  features: {
    eyebrow: string
    title: string
    description: string
    items: { icon: typeof Target; title: string; body: string }[]
  }
  flow: {
    title: string
    steps: { title: string; body: string }[]
  }
  cta: {
    title: string
    description: string
    primary: string
    secondary: string
  }
}

const copy: Record<Locale, LandingCopy> = {
  en: {
    meta: {
      title: 'Voca AI | Learn Vocabulary Faster With Smart Review',
      description:
        'Build vocabulary, practice pronunciation, review with spaced repetition, and track real mastery over time.',
    },
    nav: {
      features: 'Features',
      howItWorks: 'How it works',
      signIn: 'Sign in',
      start: 'Start learning',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Vocabulary learning that respects your memory',
      title: 'Stop collecting words.',
      highlight: 'Start remembering them.',
      description:
        'Voca AI turns your vocabulary list into a daily review system with tests, pronunciation practice, and progress you can actually trust.',
      primary: 'Create free account',
      secondary: 'Sign in',
      signedInPrimary: 'Go to dashboard',
      trust: [
        'Smart review schedule',
        'Pronunciation checks',
        'Progress you can measure',
      ],
    },
    preview: {
      today: 'Today',
      title: 'Test 12 words before they fade',
      subtitle: 'A short session confirms what is truly stored in memory.',
      action: 'Start test',
      stats: [
        { label: 'Mastered', value: '248', tone: 'text-emerald-600' },
        { label: 'Due today', value: '12', tone: 'text-indigo-600' },
        { label: 'Streak', value: '18d', tone: 'text-amber-600' },
      ],
      queue: [
        { word: 'resilient', hint: 'able to recover quickly', due: 'Now' },
        { word: 'concise', hint: 'brief but clear', due: '2h' },
        { word: 'allocate', hint: 'set apart for a purpose', due: 'Tomorrow' },
      ],
    },
    pains: {
      title: 'Built for the problems learners actually hit',
      items: [
        {
          icon: Clock3,
          title: 'You forget after a few days',
          body: 'Voca AI schedules words when they are likely to slip, so review happens at the useful moment.',
        },
        {
          icon: Mic,
          title: 'You recognize words but cannot say them',
          body: 'Speaking and listening modes turn passive vocabulary into usable language.',
        },
        {
          icon: BarChart3,
          title: 'You cannot tell what is truly mastered',
          body: 'Quiz results, levels, streaks, and memory strength show progress from tested recall, not just completed cards.',
        },
      ],
    },
    features: {
      eyebrow: 'What you get',
      title: 'A complete vocabulary workflow in one place',
      description:
        'Add words, practice them in multiple ways, test yourself, and let the app decide what needs attention next.',
      items: [
        {
          icon: ImagePlus,
          title: 'Import words from images',
          body: 'Upload lesson photos and let AI extract vocabulary so setup does not become the hard part.',
        },
        {
          icon: Target,
          title: 'Review based on recall',
          body: 'Words move through untested, practicing, and mastered states based on your answers.',
        },
        {
          icon: Zap,
          title: 'Fast test mode',
          body: 'Timed, one-shot quizzes reveal what you know without letting hints inflate your score.',
        },
        {
          icon: CalendarCheck,
          title: 'Review forecast',
          body: 'See upcoming workload without exposing the exact words before the test.',
        },
        {
          icon: Languages,
          title: 'Bilingual friendly',
          body: 'Use English and Vietnamese routes with vocabulary meanings, examples, IPA, and notes.',
        },
        {
          icon: Trophy,
          title: 'Learner leaderboard',
          body: 'Track learners, streaks, scores, mastered words, and progress across the group.',
        },
      ],
    },
    flow: {
      title: 'From new word to long-term memory',
      steps: [
        {
          title: 'Capture',
          body: 'Add vocabulary manually or extract it from an image of your lesson.',
        },
        {
          title: 'Practice',
          body: 'Review by meaning, typing, listening, speaking, or mixed sessions.',
        },
        {
          title: 'Prove',
          body: 'Take focused tests that update mastery only when recall is confirmed.',
        },
        {
          title: 'Return',
          body: 'The schedule brings words back before they disappear from memory.',
        },
      ],
    },
    cta: {
      title: 'Ready to make vocabulary stick?',
      description:
        'Create an account, add a few words, and let Voca AI build today’s smartest study plan.',
      primary: 'Start learning',
      secondary: 'I already have an account',
    },
  },
  vi: {
    meta: {
      title: 'Voca AI | Học từ vựng nhanh hơn bằng ôn tập thông minh',
      description:
        'Voca AI giúp bạn học từ vựng, luyện phát âm, ôn đúng thời điểm và theo dõi mức độ thuộc thật sự.',
    },
    nav: {
      features: 'Tính năng',
      howItWorks: 'Cách học',
      signIn: 'Đăng nhập',
      start: 'Bắt đầu học',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Học từ vựng theo cách trí nhớ hoạt động',
      title: 'Đừng chỉ lưu từ mới.',
      highlight: 'Hãy nhớ được chúng.',
      description:
        'Voca AI biến danh sách từ vựng thành hệ thống học mỗi ngày với kiểm tra trí nhớ, luyện phát âm và tiến độ đáng tin.',
      primary: 'Tạo tài khoản miễn phí',
      secondary: 'Đăng nhập',
      signedInPrimary: 'Vào dashboard',
      trust: [
        'Lịch ôn thông minh',
        'Kiểm tra phát âm',
        'Theo dõi mức độ thuộc',
      ],
    },
    preview: {
      today: 'Hôm nay',
      title: 'Kiểm tra 12 từ trước khi quên',
      subtitle: 'Một phiên ngắn xác nhận điều gì thật sự còn trong trí nhớ.',
      action: 'Bắt đầu kiểm tra',
      stats: [
        { label: 'Đã thuộc', value: '248', tone: 'text-emerald-600' },
        { label: 'Đến hạn', value: '12', tone: 'text-indigo-600' },
        { label: 'Streak', value: '18d', tone: 'text-amber-600' },
      ],
      queue: [
        { word: 'resilient', hint: 'phục hồi nhanh', due: 'Ngay' },
        { word: 'concise', hint: 'ngắn gọn, rõ ràng', due: '2h' },
        { word: 'allocate', hint: 'phân bổ cho mục đích', due: 'Mai' },
      ],
    },
    pains: {
      title: 'Tập trung vào những vấn đề người học thật sự gặp',
      items: [
        {
          icon: Clock3,
          title: 'Học xong vài ngày lại quên',
          body: 'Voca AI đưa từ quay lại đúng lúc trí nhớ bắt đầu yếu đi, thay vì ôn lan man.',
        },
        {
          icon: Mic,
          title: 'Nhìn thì biết nhưng nói không ra',
          body: 'Chế độ nghe và nói giúp từ vựng chuyển từ nhận diện thụ động sang dùng được thật.',
        },
        {
          icon: BarChart3,
          title: 'Không biết mình thuộc thật chưa',
          body: 'Điểm kiểm tra, level, streak và độ bền trí nhớ phản ánh khả năng nhớ lại, không chỉ số card đã xem.',
        },
      ],
    },
    features: {
      eyebrow: 'Bạn sẽ có gì',
      title: 'Một quy trình học từ vựng đầy đủ',
      description:
        'Thêm từ, luyện theo nhiều dạng, kiểm tra lại và để hệ thống chọn điều cần học tiếp theo.',
      items: [
        {
          icon: ImagePlus,
          title: 'Nhập từ từ ảnh',
          body: 'Upload ảnh bài học và để AI trích xuất từ vựng, giảm thời gian nhập liệu.',
        },
        {
          icon: Target,
          title: 'Ôn theo khả năng nhớ',
          body: 'Từ đi qua các trạng thái chưa kiểm tra, đang luyện và đã thuộc dựa trên câu trả lời.',
        },
        {
          icon: Zap,
          title: 'Kiểm tra nhanh',
          body: 'Bài test có thời gian và chỉ một lần trả lời để đo đúng khả năng nhớ thật.',
        },
        {
          icon: CalendarCheck,
          title: 'Dự báo lịch ôn',
          body: 'Biết khối lượng ôn sắp tới mà không bị lộ trước chính xác từ nào sẽ kiểm tra.',
        },
        {
          icon: Languages,
          title: 'Phù hợp Anh - Việt',
          body: 'Quản lý nghĩa, ví dụ, IPA, ghi chú và route tiếng Anh/tiếng Việt.',
        },
        {
          icon: Trophy,
          title: 'Theo dõi học viên',
          body: 'Xem streak, điểm, số từ đã thuộc và tiến độ của từng người học.',
        },
      ],
    },
    flow: {
      title: 'Từ mới đến trí nhớ dài hạn',
      steps: [
        {
          title: 'Nhập',
          body: 'Thêm từ thủ công hoặc trích xuất từ ảnh bài học.',
        },
        {
          title: 'Luyện',
          body: 'Ôn bằng nghĩa, gõ từ, nghe, nói hoặc phiên mixed.',
        },
        {
          title: 'Kiểm tra',
          body: 'Bài test cập nhật mastery chỉ khi bạn thật sự nhớ lại đúng.',
        },
        {
          title: 'Quay lại',
          body: 'Lịch ôn đưa từ trở lại trước khi chúng biến mất khỏi trí nhớ.',
        },
      ],
    },
    cta: {
      title: 'Sẵn sàng học từ vựng cho nhớ lâu?',
      description:
        'Tạo tài khoản, thêm vài từ đầu tiên và để Voca AI xây kế hoạch học thông minh cho hôm nay.',
      primary: 'Bắt đầu học',
      secondary: 'Tôi đã có tài khoản',
    },
  },
}

function getCopy(locale: string): LandingCopy {
  return copy[locale as Locale] ?? copy.en
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = getCopy(locale)

  return {
    title: {
      absolute: t.meta.title,
    },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: `/${locale}`,
    },
    twitter: {
      title: t.meta.title,
      description: t.meta.description,
    },
  }
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = getCopy(locale)
  const user = await currentUser()
  const signedIn = !!user
  const dashboardHref = `/${locale}/admin/dashboard`
  const signInHref = `/${locale}/sign-in`
  const signUpHref = `/${locale}/sign-up`
  const primaryHref = signedIn ? dashboardHref : signUpHref
  const primaryLabel = signedIn ? t.hero.signedInPrimary : t.hero.primary
  const isVi = locale === 'vi'
  const themeOptions = isVi
    ? [
        { id: 'theme-light', label: 'Sáng' },
        { id: 'theme-dark', label: 'Tối' },
      ]
    : [
        { id: 'theme-light', label: 'Light' },
        { id: 'theme-dark', label: 'Dark' },
      ]

  return (
    <>
      <input
        id="theme-light"
        className="landing-control"
        name="landing-theme"
        type="radio"
        defaultChecked
      />
      <input
        id="theme-dark"
        className="landing-control"
        name="landing-theme"
        type="radio"
      />

      <main className="landing-page min-h-screen bg-[#f7f9fc] text-slate-950">
        <LandingStyles />
        <section className="landing-hero relative isolate min-h-[96vh] overflow-hidden">
          <MultiverseScene />

          <header className="landing-header relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 py-4 sm:flex-nowrap sm:px-8 lg:px-10">
            <Link
              href={`/${locale}`}
              className="flex min-w-0 shrink-0 items-center gap-2.5"
            >
              <AppLogo />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
              <a
                href="#features"
                className="transition-colors hover:text-slate-950"
              >
                {t.nav.features}
              </a>
              <a
                href="#how-it-works"
                className="transition-colors hover:text-slate-950"
              >
                {t.nav.howItWorks}
              </a>
            </nav>

            <div className="landing-header-actions flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
              <div
                className="landing-segment hidden items-center gap-1 rounded-lg border border-white/70 bg-white/72 p-1 shadow-sm backdrop-blur lg:flex"
                aria-label={
                  isVi ? 'Đổi nền sáng tối' : 'Change light or dark background'
                }
              >
                {themeOptions.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    className="theme-choice landing-segment-item rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
                  >
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="landing-segment flex rounded-lg border border-white/70 bg-white/72 p-1 text-xs font-semibold shadow-sm backdrop-blur">
                <Link
                  href="/en"
                  className={cn(
                    'landing-segment-item rounded-md px-2 py-1.5 transition-colors',
                    locale === 'en'
                      ? 'is-active bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950',
                  )}
                >
                  EN
                </Link>
                <Link
                  href="/vi"
                  className={cn(
                    'landing-segment-item rounded-md px-2 py-1.5 transition-colors',
                    locale === 'vi'
                      ? 'is-active bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950',
                  )}
                >
                  VI
                </Link>
              </div>
              <Link
                href={signedIn ? dashboardHref : signInHref}
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className:
                    'landing-nav-action text-slate-700 hover:bg-white/70 hover:text-slate-950',
                })}
              >
                {signedIn ? t.nav.dashboard : t.nav.signIn}
              </Link>
              <Link
                href={primaryHref}
                className={buttonVariants({
                  size: 'sm',
                  className:
                    'landing-primary-action bg-slate-950 text-white hover:bg-slate-800 [a]:hover:bg-slate-800',
                })}
              >
                {t.nav.start}
              </Link>
            </div>
          </header>

          <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-8 pb-14 sm:px-8 sm:pt-16 sm:pb-16 lg:px-10 lg:pt-20 lg:pb-20">
            <div className="hero-copy max-w-3xl">
              <div className="hero-badge inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-200 bg-white/75 px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur">
                <Sparkles size={15} />
                {t.hero.badge}
              </div>

              <h1 className="hero-title mt-6 max-w-4xl text-[2rem] leading-[1.06] font-[720] tracking-normal text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.98]">
                {t.hero.title}
                <span className="block text-indigo-600">
                  {t.hero.highlight}
                </span>
              </h1>

              <p className="hero-description mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
                {t.hero.description}
              </p>

              <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  className={buttonVariants({
                    size: 'lg',
                    className:
                      'h-12 w-full gap-2 rounded-lg bg-slate-950 px-5 text-base text-white hover:bg-slate-800 sm:w-auto [a]:hover:bg-slate-800',
                  })}
                >
                  {primaryLabel}
                  <ArrowRight size={18} />
                </Link>
                {!signedIn && (
                  <Link
                    href={signInHref}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'lg',
                      className:
                        'h-12 w-full rounded-lg border-slate-300 bg-white/80 px-5 text-base text-slate-900 hover:bg-white sm:w-auto',
                    })}
                  >
                    {t.hero.secondary}
                  </Link>
                )}
              </div>

              <div className="hero-trust mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
                {t.hero.trust.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>

              <div
                className="mt-5 flex flex-wrap gap-2 lg:hidden"
                aria-label={
                  isVi ? 'Đổi nền sáng tối' : 'Change light or dark background'
                }
              >
                {themeOptions.map((option) => (
                  <label
                    key={`mobile-${option.id}`}
                    htmlFor={option.id}
                    className="theme-choice landing-segment-item rounded-md border border-white/70 bg-white/72 px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-slate-950"
                  >
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="hero-preview mt-12 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
              <ProductPreview copy={t.preview} />
              <OutcomePanel locale={locale} />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-3 lg:px-10">
            {t.pains.items.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Icon size={20} />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-[#f7f9fc] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.14em] text-indigo-600 uppercase">
                {t.features.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-[680] tracking-normal text-slate-950 sm:text-4xl">
                {t.features.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {t.features.description}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.features.items.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-[680] tracking-normal text-slate-950 sm:text-4xl">
                  {t.flow.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {locale === 'vi'
                    ? 'Mục tiêu không phải là học thật nhiều trong một ngày, mà là quay lại đúng lúc để từ vựng trở thành kiến thức dùng được.'
                    : 'The goal is not to cram more words in one day. It is to return at the right time until vocabulary becomes usable knowledge.'}
                </p>
                <p className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800">
                  {isVi
                    ? 'Chọn từng bước để thấy hệ thống dẫn người học đi từ từ mới đến trí nhớ dài hạn.'
                    : 'Tap each step to see how the product guides a learner from new word to long-term memory.'}
                </p>
              </div>

              <div className="flow-experience rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
                {t.flow.steps.map((step, index) => (
                  <input
                    key={`flow-input-${step.title}`}
                    id={`flow-step-${index}`}
                    className="flow-control"
                    name="flow-step"
                    type="radio"
                    defaultChecked={index === 0}
                  />
                ))}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {t.flow.steps.map((step, index) => (
                    <label
                      key={`flow-label-${step.title}`}
                      htmlFor={`flow-step-${index}`}
                      className="flow-tab rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <span className="mt-3 block text-sm font-semibold text-slate-950">
                        {step.title}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flow-stage mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {t.flow.steps.map((step, index) => (
                    <div
                      key={`flow-panel-${step.title}`}
                      className={`flow-panel flow-panel-${index} grid gap-6 p-5 sm:p-6 md:grid-cols-[0.9fr_1.1fr]`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-indigo-600">
                          {isVi ? `Bước ${index + 1}` : `Step ${index + 1}`}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-slate-600">
                          {step.body}
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-sm font-medium text-white">
                          <Sparkles size={14} />
                          {isVi
                            ? [
                                'AI đọc bài học',
                                'Luyện đa dạng',
                                'Đo trí nhớ thật',
                                'Tự quay lại đúng lúc',
                              ][index]
                            : [
                                'AI reads the lesson',
                                'Practice several ways',
                                'Measure real recall',
                                'Return at the right time',
                              ][index]}
                        </div>
                      </div>
                      <FlowVisual index={index} locale={locale} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#eef4ff] px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl rounded-lg bg-slate-950 px-6 py-10 text-center text-white shadow-xl sm:px-10">
            <h2 className="text-3xl font-[680] tracking-normal">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-300">
              {t.cta.description}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className={buttonVariants({
                  size: 'lg',
                  className:
                    'h-12 w-full rounded-lg bg-white px-5 text-base text-slate-950 hover:bg-slate-100 sm:w-auto [a]:hover:bg-slate-100',
                })}
              >
                {signedIn ? t.hero.signedInPrimary : t.cta.primary}
              </Link>
              {!signedIn && (
                <Link
                  href={signInHref}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className:
                      'h-12 w-full rounded-lg border-white/20 bg-white/5 px-5 text-base text-white hover:bg-white/10 hover:text-white sm:w-auto',
                  })}
                >
                  {t.cta.secondary}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function MultiverseScene() {
  return (
    <div className="multiverse-scene" aria-hidden="true">
      <div className="star-layer star-layer-one" />
      <div className="star-layer star-layer-two" />
      <div className="portal portal-left">
        <span />
      </div>
      <div className="portal portal-right">
        <span />
      </div>
      <StudyMascot kind="owl" className="study-mascot mascot-owl" />
      <StudyMascot kind="cat" className="study-mascot mascot-cat" />
      <StudyMascot kind="bear" className="study-mascot mascot-bear" />
      <div className="floating-shape floating-book" />
      <div className="floating-shape floating-pencil" />
      <div className="floating-shape floating-sparkle" />
    </div>
  )
}

function StudyMascot({
  kind,
  className,
}: {
  kind: 'owl' | 'cat' | 'bear'
  className: string
}) {
  const palette = {
    owl: {
      body: '#F59E0B',
      face: '#FEF3C7',
      accent: '#2563EB',
      ear: '#D97706',
    },
    cat: {
      body: '#FB7185',
      face: '#FFE4E6',
      accent: '#7C3AED',
      ear: '#E11D48',
    },
    bear: {
      body: '#A16207',
      face: '#FEF3C7',
      accent: '#0891B2',
      ear: '#854D0E',
    },
  }[kind]

  const ears =
    kind === 'cat' ? (
      <>
        <path d="M30 44L39 22L51 43Z" fill={palette.ear} />
        <path d="M82 43L95 22L102 44Z" fill={palette.ear} />
      </>
    ) : (
      <>
        <circle cx="38" cy="43" r="14" fill={palette.ear} />
        <circle cx="94" cy="43" r="14" fill={palette.ear} />
      </>
    )

  return (
    <svg
      className={className}
      width="150"
      height="150"
      viewBox="0 0 132 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="66" cy="119" rx="38" ry="8" fill="#0F172A" opacity="0.12" />
      {ears}
      <circle cx="66" cy="67" r="43" fill={palette.body} />
      <path d="M26 45L66 24L106 45L66 66Z" fill="#0F172A" />
      <path
        d="M42 50H90V61C90 68 84 74 77 74H55C48 74 42 68 42 61V50Z"
        fill={palette.accent}
      />
      <path
        d="M102 45V66"
        stroke="#0F172A"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="102" cy="72" r="6" fill="#FBBF24" />
      <ellipse cx="66" cy="74" rx="30" ry="27" fill={palette.face} />
      <circle cx="54" cy="69" r="6" fill="#0F172A" />
      <circle cx="78" cy="69" r="6" fill="#0F172A" />
      <circle cx="56" cy="67" r="2" fill="white" />
      <circle cx="80" cy="67" r="2" fill="white" />
      {kind === 'owl' ? (
        <path d="M61 79L66 86L71 79Z" fill="#F97316" />
      ) : (
        <>
          <path d="M62 80H70L66 85Z" fill="#0F172A" />
          <path
            d="M66 85C62 91 57 91 54 88"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M66 85C70 91 75 91 78 88"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      <rect
        x="39"
        y="99"
        width="54"
        height="15"
        rx="7.5"
        fill="white"
        opacity="0.92"
      />
      <path
        d="M50 106H82"
        stroke={palette.accent}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FlowVisual({ index, locale }: { index: number; locale: string }) {
  const isVi = locale === 'vi'
  const labels = isVi
    ? [
        ['Ảnh bài học', 'AI trích xuất', 'Từ mới'],
        ['Nghĩa', 'Nghe', 'Nói'],
        ['20s', 'Một lần', 'Không gợi ý'],
        ['Mai', '3 ngày', '7 ngày'],
      ]
    : [
        ['Lesson image', 'AI extracts', 'New words'],
        ['Meaning', 'Listen', 'Speak'],
        ['20s', 'One shot', 'No hints'],
        ['Tomorrow', '3 days', '7 days'],
      ]
  const activeLabels = labels[index]

  return (
    <div className="flow-visual relative min-h-56 overflow-hidden rounded-lg bg-slate-950 p-4 text-white sm:min-h-64">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.34),transparent_34%),linear-gradient(135deg,#0f172a,#111827)]" />
      <div className="flow-line absolute top-1/2 right-6 left-6 h-px bg-cyan-300/45" />
      {activeLabels.map((label, labelIndex) => (
        <div
          key={label}
          className={`flow-node flow-node-${labelIndex} absolute max-w-[44%] rounded-lg border border-white/16 bg-white/12 px-3 py-2 text-sm leading-tight font-semibold shadow-lg backdrop-blur`}
        >
          {label}
        </div>
      ))}
      <div className="flow-pulse absolute h-16 w-16 rounded-full border border-cyan-200/50" />
      <div className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold tracking-[0.16em] text-cyan-200 uppercase">
            Voca AI
          </span>
          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-medium text-emerald-200">
            {isVi ? 'đang tối ưu' : 'optimizing'}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="flow-meter h-full rounded-full bg-linear-to-r from-cyan-300 via-indigo-300 to-violet-300"
            style={{ width: `${52 + index * 12}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ProductPreview({ copy }: { copy: LandingCopy['preview'] }) {
  return (
    <div className="preview-panel rounded-lg border border-white/70 bg-white/90 p-4 shadow-2xl shadow-indigo-950/10 backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-indigo-600 uppercase">
            {copy.today}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
        </div>
        <div className="hidden h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-medium text-white sm:flex">
          <Target size={16} />
          {copy.action}
        </div>
      </div>

      <div className="preview-stats mt-4 grid gap-2 sm:gap-3">
        {copy.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3"
          >
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p
              className={cn(
                'mt-1 text-xl font-semibold sm:text-2xl',
                stat.tone,
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {copy.queue.map((word) => (
          <div
            key={word.word}
            className="preview-row flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {word.word}
              </p>
              <p className="truncate text-sm text-slate-500">{word.hint}</p>
            </div>
            <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {word.due}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LandingStyles() {
  return (
    <style>{`
      .landing-control,
      .flow-control {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }

      .landing-page {
        --hero-bg-a: #eef7ff;
        --hero-bg-b: #f2efff;
        --hero-bg-c: #e9fff9;
        --portal-a: rgba(99, 102, 241, 0.32);
        --portal-b: rgba(34, 211, 238, 0.34);
        --card-glow: rgba(79, 70, 229, 0.14);
        --hero-wash-a: rgba(255,255,255,0.76);
        --hero-wash-b: rgba(247,249,252,0.9);
        overflow-x: hidden;
        transition: background 240ms ease, color 240ms ease;
      }

      #theme-dark:checked ~ .landing-page {
        --hero-bg-a: #172554;
        --hero-bg-b: #312e81;
        --hero-bg-c: #134e4a;
        --portal-a: rgba(129, 140, 248, 0.28);
        --portal-b: rgba(45, 212, 191, 0.26);
        --card-glow: rgba(125, 211, 252, 0.18);
        --hero-wash-a: rgba(2,6,23,0.24);
        --hero-wash-b: rgba(2,6,23,0.82);
        background: #020617;
        color: #f8fafc;
      }

      #theme-light:checked ~ .landing-page label[for='theme-light'],
      #theme-dark:checked ~ .landing-page label[for='theme-dark'] {
        background: #0f172a;
        color: white;
      }

      #theme-dark:checked ~ .landing-page .hero-title,
      #theme-dark:checked ~ .landing-page .hero-description,
      #theme-dark:checked ~ .landing-page .hero-trust,
      #theme-dark:checked ~ .landing-page header nav a,
      #theme-dark:checked ~ .landing-page header a {
        color: #f8fafc;
      }

      #theme-dark:checked ~ .landing-page .hero-title span {
        color: #67e8f9;
      }

      #theme-dark:checked ~ .landing-page .theme-choice,
      #theme-dark:checked ~ .landing-page header .text-slate-600,
      #theme-dark:checked ~ .landing-page header .text-slate-700 {
        color: #cbd5e1;
      }

      #theme-dark:checked ~ .landing-page .hero-badge {
        border-color: rgba(125, 211, 252, 0.34);
        background: rgba(15, 23, 42, 0.62);
        color: #a5f3fc;
      }

      #theme-dark:checked ~ .landing-page section:not(.landing-hero) {
        background: #020617 !important;
        border-color: rgba(148, 163, 184, 0.18) !important;
      }

      #theme-dark:checked ~ .landing-page section:nth-of-type(2) {
        background: linear-gradient(180deg, #061323, #020617) !important;
      }

      #theme-dark:checked ~ .landing-page section:nth-of-type(3) {
        background: #07111f !important;
      }

      #theme-dark:checked ~ .landing-page section:nth-of-type(4) {
        background: #020617 !important;
      }

      #theme-dark:checked ~ .landing-page section:nth-of-type(5) {
        background: linear-gradient(180deg, #07111f, #020617) !important;
      }

      #theme-dark:checked ~ .landing-page article,
      #theme-dark:checked ~ .landing-page section:not(.landing-hero) .rounded-lg,
      #theme-dark:checked ~ .landing-page .preview-panel,
      #theme-dark:checked ~ .landing-page .preview-row,
      #theme-dark:checked ~ .landing-page .flow-experience,
      #theme-dark:checked ~ .landing-page .flow-stage,
      #theme-dark:checked ~ .landing-page .flow-tab {
        background-color: rgba(15, 23, 42, 0.74) !important;
        border-color: rgba(148, 163, 184, 0.22) !important;
        color: #f8fafc !important;
      }

      #theme-dark:checked ~ .landing-page .preview-panel,
      #theme-dark:checked ~ .landing-page .preview-row,
      #theme-dark:checked ~ .landing-page .flow-experience,
      #theme-dark:checked ~ .landing-page .flow-stage {
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28) !important;
      }

      #theme-dark:checked ~ .landing-page h2,
      #theme-dark:checked ~ .landing-page h3,
      #theme-dark:checked ~ .landing-page .text-slate-950,
      #theme-dark:checked ~ .landing-page .text-slate-900 {
        color: #f8fafc !important;
      }

      #theme-dark:checked ~ .landing-page p,
      #theme-dark:checked ~ .landing-page .text-slate-600,
      #theme-dark:checked ~ .landing-page .text-slate-500,
      #theme-dark:checked ~ .landing-page .text-slate-700 {
        color: #cbd5e1 !important;
      }

      #theme-dark:checked ~ .landing-page .border-slate-200,
      #theme-dark:checked ~ .landing-page .border-slate-300,
      #theme-dark:checked ~ .landing-page .border-indigo-100 {
        border-color: rgba(148, 163, 184, 0.22) !important;
      }

      #theme-dark:checked ~ .landing-page .bg-slate-50,
      #theme-dark:checked ~ .landing-page .bg-slate-50\\/70,
      #theme-dark:checked ~ .landing-page .bg-slate-100,
      #theme-dark:checked ~ .landing-page .bg-indigo-50,
      #theme-dark:checked ~ .landing-page .bg-sky-100,
      #theme-dark:checked ~ .landing-page .bg-emerald-100,
      #theme-dark:checked ~ .landing-page .bg-emerald-50,
      #theme-dark:checked ~ .landing-page .bg-white,
      #theme-dark:checked ~ .landing-page .bg-white\\/80,
      #theme-dark:checked ~ .landing-page .bg-white\\/90 {
        background-color: rgba(30, 41, 59, 0.82) !important;
      }

      #theme-dark:checked ~ .landing-page .text-indigo-600,
      #theme-dark:checked ~ .landing-page .text-indigo-700,
      #theme-dark:checked ~ .landing-page .text-sky-700,
      #theme-dark:checked ~ .landing-page .text-emerald-700,
      #theme-dark:checked ~ .landing-page .text-emerald-600,
      #theme-dark:checked ~ .landing-page .text-amber-600 {
        color: #67e8f9 !important;
      }

      #theme-dark:checked ~ .landing-page .bg-slate-950 {
        background-color: #67e8f9 !important;
        color: #020617 !important;
      }

      #theme-dark:checked ~ .landing-page .bg-white.text-slate-950,
      #theme-dark:checked ~ .landing-page a.bg-white {
        background-color: #f8fafc !important;
        color: #020617 !important;
      }

      #theme-dark:checked ~ .landing-page .flow-visual {
        background-color: #020617 !important;
      }

      #theme-dark:checked ~ .landing-page .theme-choice {
        border-color: rgba(148, 163, 184, 0.24) !important;
        background-color: rgba(15, 23, 42, 0.62) !important;
      }

      #theme-dark:checked ~ .landing-page label[for='theme-dark'] {
        background: #67e8f9 !important;
        color: #020617 !important;
      }

      .landing-segment {
        transition:
          background-color 180ms ease,
          border-color 180ms ease,
          box-shadow 180ms ease;
      }

      .landing-segment-item {
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .landing-segment-item.is-active {
        background: #0f172a;
        color: white;
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.16);
      }

      .landing-header,
      .landing-header-actions,
      .hero-copy,
      .preview-panel,
      .flow-experience,
      .flow-stage {
        min-width: 0;
      }

      .landing-primary-action {
        min-width: 0;
      }

      .hero-title {
        text-wrap: balance;
      }

      .preview-stats {
        grid-template-columns: minmax(0, 1fr);
      }

      #theme-dark:checked ~ .landing-page .landing-segment {
        background: rgba(15, 23, 42, 0.68) !important;
        border-color: rgba(148, 163, 184, 0.22) !important;
        box-shadow: 0 10px 28px rgba(2, 6, 23, 0.22) !important;
      }

      #theme-dark:checked ~ .landing-page .landing-segment-item {
        background: transparent !important;
        color: #cbd5e1 !important;
      }

      #theme-dark:checked ~ .landing-page .landing-segment-item:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #f8fafc !important;
      }

      #theme-dark:checked ~ .landing-page .landing-segment-item.is-active,
      #theme-dark:checked ~ .landing-page label[for='theme-dark'] {
        background: #67e8f9 !important;
        color: #020617 !important;
        box-shadow: 0 8px 18px rgba(103, 232, 249, 0.24) !important;
      }

      #theme-dark:checked ~ .landing-page label[for='theme-light'] {
        background: transparent !important;
        color: #cbd5e1 !important;
        box-shadow: none !important;
      }

      #theme-dark:checked ~ .landing-page .landing-nav-action {
        background: transparent !important;
        color: #e2e8f0 !important;
      }

      #theme-dark:checked ~ .landing-page .landing-nav-action:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
      }

      #theme-dark:checked ~ .landing-page .landing-primary-action {
        background: #67e8f9 !important;
        color: #020617 !important;
        box-shadow: 0 10px 26px rgba(103, 232, 249, 0.24) !important;
      }

      #theme-dark:checked ~ .landing-page .landing-primary-action:hover {
        background: #a5f3fc !important;
        color: #020617 !important;
      }

      .landing-hero {
        background:
          linear-gradient(180deg, var(--hero-wash-a), var(--hero-wash-b)),
          radial-gradient(circle at 12% 12%, var(--hero-bg-a), transparent 36%),
          radial-gradient(circle at 84% 18%, var(--hero-bg-b), transparent 34%),
          radial-gradient(circle at 70% 88%, var(--hero-bg-c), transparent 36%),
          #f7f9fc;
      }

      .multiverse-scene {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }

      .star-layer {
        position: absolute;
        inset: -20%;
        background-image:
          radial-gradient(circle, rgba(99,102,241,0.24) 0 1px, transparent 1.6px),
          radial-gradient(circle, rgba(14,165,233,0.2) 0 1px, transparent 1.4px);
        background-size: 92px 92px, 137px 137px;
        animation: starDrift 28s linear infinite;
      }

      .star-layer-two {
        opacity: 0.56;
        animation-duration: 42s;
        animation-direction: reverse;
      }

      .portal {
        position: absolute;
        border: 1px solid rgba(255,255,255,0.7);
        border-radius: 999px;
        box-shadow:
          inset 0 0 34px rgba(255,255,255,0.72),
          0 24px 70px var(--card-glow);
        animation: portalFloat 10s ease-in-out infinite;
      }

      .portal span {
        position: absolute;
        inset: 14%;
        border-radius: inherit;
        border: 2px dashed rgba(79,70,229,0.28);
        animation: portalSpin 18s linear infinite;
      }

      .portal-left {
        left: -78px;
        top: 180px;
        width: 280px;
        height: 280px;
        background: radial-gradient(circle at 45% 45%, var(--portal-b), transparent 62%);
      }

      .portal-right {
        right: -110px;
        top: 70px;
        width: 390px;
        height: 390px;
        background: radial-gradient(circle at 50% 50%, var(--portal-a), transparent 64%);
        animation-delay: -4s;
      }

      .study-mascot {
        position: absolute;
        filter: drop-shadow(0 22px 34px rgba(15, 23, 42, 0.14));
        transform-origin: center bottom;
        animation: mascotFloat 6.5s ease-in-out infinite;
      }

      .mascot-owl {
        right: 11%;
        top: 42%;
        width: 156px;
        height: 156px;
      }

      .mascot-cat {
        right: 30%;
        top: 12%;
        width: 118px;
        height: 118px;
        animation-delay: -2.2s;
      }

      .mascot-bear {
        left: 8%;
        top: 45%;
        width: 132px;
        height: 132px;
        animation-delay: -4s;
      }

      .floating-shape {
        position: absolute;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.88);
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
        animation: softFloat 8s ease-in-out infinite;
      }

      .floating-book {
        right: 24%;
        bottom: 21%;
        width: 62px;
        height: 46px;
        background:
          linear-gradient(90deg, #ffffff 0 48%, #dbeafe 48% 52%, #ffffff 52%),
          #fff;
      }

      .floating-pencil {
        left: 20%;
        top: 22%;
        width: 76px;
        height: 16px;
        border-radius: 999px;
        background: linear-gradient(90deg, #fbbf24 0 70%, #f97316 70% 82%, #0f172a 82%);
        transform: rotate(-16deg);
        animation-delay: -3s;
      }

      .floating-sparkle {
        right: 43%;
        bottom: 34%;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: #a5f3fc;
        animation-delay: -1.4s;
      }

      .hero-badge,
      .hero-title,
      .hero-description,
      .hero-actions,
      .hero-trust,
      .hero-preview {
        animation: heroReveal 720ms ease both;
      }

      .hero-title { animation-delay: 90ms; }
      .hero-description { animation-delay: 180ms; }
      .hero-actions { animation-delay: 270ms; }
      .hero-trust { animation-delay: 360ms; }
      .hero-preview { animation-delay: 450ms; }

      .preview-panel {
        animation: panelRise 860ms 520ms ease both;
      }

      .flow-control:not(:checked) + .flow-control {
        pointer-events: none;
      }

      .flow-panel {
        display: none;
      }

      #flow-step-0:checked ~ .flow-stage .flow-panel-0,
      #flow-step-1:checked ~ .flow-stage .flow-panel-1,
      #flow-step-2:checked ~ .flow-stage .flow-panel-2,
      #flow-step-3:checked ~ .flow-stage .flow-panel-3 {
        display: grid;
        animation: flowReveal 360ms ease both;
      }

      #flow-step-0:checked ~ .grid label[for='flow-step-0'],
      #flow-step-1:checked ~ .grid label[for='flow-step-1'],
      #flow-step-2:checked ~ .grid label[for='flow-step-2'],
      #flow-step-3:checked ~ .grid label[for='flow-step-3'] {
        border-color: #6366f1;
        background: #eef2ff;
        box-shadow: 0 12px 30px rgba(99,102,241,0.12);
      }

      #flow-step-0:checked ~ .grid label[for='flow-step-0'] span:first-child,
      #flow-step-1:checked ~ .grid label[for='flow-step-1'] span:first-child,
      #flow-step-2:checked ~ .grid label[for='flow-step-2'] span:first-child,
      #flow-step-3:checked ~ .grid label[for='flow-step-3'] span:first-child {
        background: #4f46e5;
        color: white;
      }

      .flow-node {
        animation: nodePop 900ms ease both;
      }

      .flow-node-0 { left: 8%; top: 28%; }
      .flow-node-1 { left: 39%; top: 16%; animation-delay: 120ms; }
      .flow-node-2 { right: 8%; top: 35%; animation-delay: 240ms; }

      .flow-pulse {
        left: 46%;
        top: 32%;
        transform: translate(-50%, -50%);
        animation: pulseRing 2.2s ease-in-out infinite;
      }

      .flow-meter {
        animation: meterGlow 2.6s ease-in-out infinite;
      }

      @keyframes starDrift {
        from { transform: translate3d(0, 0, 0); }
        to { transform: translate3d(92px, 92px, 0); }
      }

      @keyframes portalFloat {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0, -18px, 0) scale(1.03); }
      }

      @keyframes portalSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes mascotFloat {
        0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
        50% { transform: translate3d(0, -10px, 0) rotate(1.4deg); }
      }

      @keyframes softFloat {
        0%, 100% { transform: translate3d(0, 0, 0) rotate(-4deg); }
        50% { transform: translate3d(0, -12px, 0) rotate(4deg); }
      }

      @keyframes heroReveal {
        from { opacity: 0; transform: translate3d(0, 18px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes panelRise {
        from { opacity: 0; transform: translate3d(0, 24px, 0) scale(0.98); }
        to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }

      @keyframes flowReveal {
        from { opacity: 0; transform: translate3d(12px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes nodePop {
        from { opacity: 0; transform: translateY(12px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes pulseRing {
        0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.7); }
        50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.25); }
      }

      @keyframes meterGlow {
        0%, 100% { filter: saturate(1); }
        50% { filter: saturate(1.5) brightness(1.16); }
      }

      @media (max-width: 1024px) {
        .landing-hero {
          min-height: auto;
        }

        .portal-left {
          left: -170px;
          opacity: 0.46;
        }

        .portal-right {
          right: -190px;
          opacity: 0.5;
        }

        .mascot-owl {
          right: 3%;
          top: 38%;
          width: 118px;
          height: 118px;
          opacity: 0.46;
        }

        .mascot-cat {
          right: 9%;
          top: 13%;
          width: 90px;
          height: 90px;
          opacity: 0.52;
        }

        .mascot-bear {
          left: auto;
          right: 1%;
          top: 58%;
          width: 96px;
          height: 96px;
          opacity: 0.3;
        }

        .floating-book,
        .floating-pencil {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .portal-left,
        .portal-right {
          opacity: 0.3;
        }

        .mascot-owl,
        .mascot-cat,
        .floating-shape {
          display: none;
        }

        .mascot-bear {
          right: -26px;
          top: 350px;
          width: 84px;
          height: 84px;
          opacity: 0.18;
        }

        .flow-pulse {
          width: 52px;
          height: 52px;
        }

        .flow-node-0 { left: 6%; top: 24%; }
        .flow-node-1 { left: 25%; top: 43%; }
        .flow-node-2 { right: 6%; top: 28%; }
      }

      @media (max-width: 640px) {
        .landing-header {
          align-items: flex-start;
        }

        .landing-header-actions {
          flex: 0 0 100%;
          justify-content: space-between;
          width: 100%;
        }

        .landing-nav-action {
          display: none !important;
        }

        .landing-primary-action {
          flex: 1 1 auto;
          max-width: none;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-badge {
          align-items: flex-start;
          white-space: normal;
        }

        .hero-actions a {
          min-height: 48px;
          height: auto;
          white-space: normal;
          text-align: center;
        }

        .hero-trust {
          gap: 8px 14px;
        }

        .flow-tab {
          min-height: 82px;
        }

        .flow-node {
          max-width: 46%;
          padding: 7px 8px;
          font-size: 12px;
        }
      }

      @media (min-width: 420px) {
        .preview-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 380px) {
        .landing-header-actions {
          justify-content: space-between;
        }

        .landing-primary-action {
          max-width: none;
        }

        .landing-segment-item {
          min-width: 34px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  )
}

function OutcomePanel({ locale }: { locale: string }) {
  const isVi = locale === 'vi'
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-xl shadow-sky-950/10 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Flame size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {isVi ? 'Động lực mỗi ngày' : 'Daily momentum'}
            </p>
            <p className="text-2xl font-semibold text-slate-950">
              18 {isVi ? 'ngày' : 'days'}
            </p>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[76%] rounded-full bg-linear-to-r from-emerald-500 to-sky-500" />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isVi
            ? 'Streak và nhắc lịch giúp việc học trở thành thói quen nhỏ nhưng đều.'
            : 'Streaks and reminders make studying a small, steady habit.'}
        </p>
      </div>

      <div className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-xl shadow-sky-950/10 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {isVi ? 'Độ bền trí nhớ' : 'Memory strength'}
              </p>
              <p className="text-2xl font-semibold text-slate-950">84%</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {isVi ? 'Tốt' : 'Strong'}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {[70, 88, 56, 92, 78, 64, 86].map((height, index) => (
            <div
              key={index}
              className="flex h-16 items-end rounded bg-slate-100 px-1 sm:h-20"
            >
              <div
                className="w-full rounded bg-indigo-500"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
