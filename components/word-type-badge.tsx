import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

const WORD_TYPE_STYLES: Record<string, string> = {
  noun: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  verb: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300',
  adjective:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  adverb:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300',
  preposition:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
  pronoun:
    'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300',
  conjunction:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300',
  interjection:
    'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-300',
  determiner:
    'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-500/30 dark:bg-lime-500/15 dark:text-lime-300',
  phrase:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-300',
}

const WORD_TYPE_ALIASES: Record<string, keyof typeof WORD_TYPE_STYLES> = {
  n: 'noun',
  noun: 'noun',
  nouns: 'noun',
  v: 'verb',
  verb: 'verb',
  verbs: 'verb',
  adj: 'adjective',
  adjective: 'adjective',
  adjectives: 'adjective',
  adv: 'adverb',
  adverb: 'adverb',
  adverbs: 'adverb',
  prep: 'preposition',
  preposition: 'preposition',
  prepositions: 'preposition',
  pron: 'pronoun',
  pronoun: 'pronoun',
  pronouns: 'pronoun',
  conj: 'conjunction',
  conjunction: 'conjunction',
  conjunctions: 'conjunction',
  interj: 'interjection',
  interjection: 'interjection',
  determiner: 'determiner',
  det: 'determiner',
  article: 'determiner',
  phrase: 'phrase',
  phr: 'phrase',
}

function normalizeWordType(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '')
}

interface WordTypeBadgeProps {
  value: string
  className?: string
}

export function WordTypeBadge({ value, className }: WordTypeBadgeProps) {
  const type = WORD_TYPE_ALIASES[normalizeWordType(value)]
  const typeClassName =
    type && WORD_TYPE_STYLES[type]
      ? WORD_TYPE_STYLES[type]
      : 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-300'

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-4 rounded px-1.5 py-0 text-[10px] font-medium',
        typeClassName,
        className,
      )}
    >
      {value}
    </Badge>
  )
}
