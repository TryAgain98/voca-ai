import { resolve } from 'path'

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: resolve(process.cwd(), '.env.local') })

import { AnthropicProvider, GroqProvider, OpenAIProvider } from '~/providers/ai'

import type { BaseAIProvider } from '~/providers/ai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const providers: BaseAIProvider[] = [
  new GroqProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
]

const AI_REQUEST_DELAY_MS = 2100

const VI_STOP_WORDS = new Set([
  'là',
  'có',
  'của',
  'và',
  'hoặc',
  'để',
  'trong',
  'khi',
  'với',
  'một',
  'các',
  'những',
  'được',
  'không',
  'nhiều',
  'về',
  'cho',
  'từ',
  'theo',
  'đến',
  'trên',
  'dưới',
  'tại',
  'vào',
  'ra',
  'lên',
  'xuống',
  'này',
  'đó',
  'the',
  'a',
  'an',
  'of',
  'to',
  'in',
  'is',
  'are',
  'or',
  'and',
  'for',
])

interface VocabRow {
  id: string
  word: string
  word_type: string | null
  meaning: string
  synonyms: string[]
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function tokenize(meaning: string): Set<string> {
  return new Set(
    normalize(meaning)
      .split(/[\s,;.()/]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !VI_STOP_WORDS.has(t)),
  )
}

function sharedTokenCount(a: Set<string>, b: Set<string>): number {
  let count = 0
  for (const token of a) {
    if (b.has(token)) count++
  }
  return count
}

function overlapScore(a: Set<string>, b: Set<string>, shared: number): number {
  const minSize = Math.min(a.size, b.size)
  return minSize === 0 ? 0 : shared / minSize
}

async function checkSynonymsWithFallback(
  a: VocabRow,
  b: VocabRow,
): Promise<boolean> {
  const errors: string[] = []
  for (const provider of providers) {
    try {
      return await provider.checkSynonyms(
        a.word,
        a.word_type,
        a.meaning,
        b.word,
        b.word_type,
        b.meaning,
      )
    } catch (err) {
      errors.push(
        `${provider.name}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
  console.error(`  All providers failed: ${errors.join(' | ')}`)
  return false
}

async function step0Reset(vocab: VocabRow[]): Promise<void> {
  console.log('\nStep 0 — Clearing all existing synonyms...')
  const ids = vocab.map((v) => v.id)

  const { error } = await supabase
    .from('vocabularies')
    .update({ synonyms: [] })
    .in('id', ids)

  if (error) throw error

  for (const v of vocab) v.synonyms = []
  console.log(`  → Cleared synonyms for ${ids.length} words`)
}

async function step1ExactMatch(vocab: VocabRow[]): Promise<void> {
  console.log('\nStep 1 — Exact meaning match (no AI needed)...')

  const groups = new Map<string, VocabRow[]>()
  for (const v of vocab) {
    const key = normalize(v.meaning)
    const group = groups.get(key) ?? []
    group.push(v)
    groups.set(key, group)
  }

  let updated = 0
  const multiGroups = [...groups.values()].filter((g) => g.length >= 2)
  console.log(`  Found ${multiGroups.length} exact-match groups`)

  for (const group of multiGroups) {
    for (const v of group) {
      const siblings = group
        .filter((g) => g.id !== v.id)
        .map((g) => normalize(g.word))
        .filter((w) => w !== normalize(v.word))

      if (siblings.length === 0) continue

      const { error } = await supabase
        .from('vocabularies')
        .update({ synonyms: siblings })
        .eq('id', v.id)

      if (error) {
        console.error(`  ✗ ${v.word}: ${error.message}`)
      } else {
        console.log(`  ✓ ${v.word} → [${siblings.join(', ')}]`)
        v.synonyms = siblings
        updated++
      }
    }
  }

  console.log(`  → Updated: ${updated}`)
}

interface SynonymCandidate {
  a: VocabRow
  b: VocabRow
}

async function step2PartialMatchWithAI(vocab: VocabRow[]): Promise<void> {
  console.log('\nStep 2 — Partial meaning match → AI verification...')

  const candidates: SynonymCandidate[] = []

  for (let i = 0; i < vocab.length; i++) {
    const tokensI = tokenize(vocab[i].meaning)
    if (tokensI.size === 0) continue

    for (let j = i + 1; j < vocab.length; j++) {
      if (vocab[i].synonyms.includes(normalize(vocab[j].word))) continue

      const typeI = vocab[i].word_type?.toLowerCase().trim()
      const typeJ = vocab[j].word_type?.toLowerCase().trim()
      if (typeI && typeJ && typeI !== typeJ) continue

      const tokensJ = tokenize(vocab[j].meaning)
      if (tokensJ.size === 0) continue

      const shared = sharedTokenCount(tokensI, tokensJ)
      if (shared >= 2 && overlapScore(tokensI, tokensJ, shared) >= 0.5) {
        candidates.push({ a: vocab[i], b: vocab[j] })
      }
    }
  }

  console.log(`  Found ${candidates.length} candidate pairs for AI review`)

  let confirmed = 0
  let rejected = 0

  for (let i = 0; i < candidates.length; i++) {
    const { a, b } = candidates[i]
    const isSynonym = await checkSynonymsWithFallback(a, b)

    if (!isSynonym) {
      rejected++
    } else {
      const newSynA = [...new Set([...a.synonyms, normalize(b.word)])]
      const newSynB = [...new Set([...b.synonyms, normalize(a.word)])]

      const [resA, resB] = await Promise.all([
        supabase
          .from('vocabularies')
          .update({ synonyms: newSynA })
          .eq('id', a.id),
        supabase
          .from('vocabularies')
          .update({ synonyms: newSynB })
          .eq('id', b.id),
      ])

      if (resA.error) {
        console.error(`  ✗ ${a.word}: ${resA.error.message}`)
      } else if (resB.error) {
        console.error(`  ✗ ${b.word}: ${resB.error.message}`)
      } else {
        console.log(`  ✓ ${a.word} ↔ ${b.word} (${i + 1}/${candidates.length})`)
        a.synonyms = newSynA
        b.synonyms = newSynB
        confirmed++
      }
    }

    if (i < candidates.length - 1) {
      await new Promise((r) => setTimeout(r, AI_REQUEST_DELAY_MS))
    }
  }

  console.log(`  → AI confirmed: ${confirmed}, rejected: ${rejected}`)
}

async function main(): Promise<void> {
  const { data: vocab, error } = await supabase
    .from('vocabularies')
    .select('id, word, word_type, meaning, synonyms')

  if (error) throw error
  if (!vocab?.length) {
    console.log('No vocabulary found.')
    return
  }

  console.log(`Loaded ${vocab.length} words.`)

  const rows = vocab as VocabRow[]

  await step0Reset(rows)
  await step1ExactMatch(rows)
  await step2PartialMatchWithAI(rows)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
