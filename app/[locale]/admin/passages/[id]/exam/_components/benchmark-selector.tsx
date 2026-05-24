'use client'

import { useTranslations } from 'next-intl'

import { cn } from '~/lib/utils'

import type { BenchmarkKey } from '../_hooks/use-exam-session'

interface BenchmarkOption {
  key: BenchmarkKey
  time: number | null
}

interface BenchmarkSelectorProps {
  options: BenchmarkOption[]
  selected: BenchmarkKey
  onSelect: (key: BenchmarkKey) => void
}

const BENCHMARK_STYLES: Record<BenchmarkKey, string> = {
  good: 'text-emerald-400',
  ok: 'text-amber-400',
  acceptable: 'text-orange-400',
}

export function BenchmarkSelector({
  options,
  selected,
  onSelect,
}: BenchmarkSelectorProps) {
  const t = useTranslations('Passages')

  const labelKey: Record<
    BenchmarkKey,
    'timeGood' | 'timeOk' | 'timeAcceptable'
  > = {
    good: 'timeGood',
    ok: 'timeOk',
    acceptable: 'timeAcceptable',
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-[#8a8f98]">{t('selectBenchmark')}</p>
      <div className="flex gap-2">
        {options.map(({ key, time }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg border px-4 py-2 text-sm transition-colors',
              selected === key
                ? 'border-[#5e6ad2] bg-[#5e6ad2]/15'
                : 'border-white/8 bg-white/2 hover:border-white/15',
            )}
          >
            <span className={cn('font-semibold', BENCHMARK_STYLES[key])}>
              {t(labelKey[key])}
            </span>
            <span className="text-xs text-[#8a8f98]">{time}s</span>
          </button>
        ))}
      </div>
    </div>
  )
}
