import { resolve } from 'path'

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: resolve(process.cwd(), '.env.local') })

import { findCandidates, normalize, tokenize } from '~/lib/synonym-matcher'
import { AnthropicProvider, GroqProvider, OpenAIProvider } from '~/providers/ai'

import type { SynonymCandidate } from '~/lib/synonym-matcher'
import type { BaseAIProvider } from '~/providers/ai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!process.env.GROQ_API_KEY) {
  console.error('Missing: GROQ_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const providers: BaseAIProvider[] = [
  new GroqProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
]

const AI_REQUEST_DELAY_MS = 2100

async function checkWithFallback(
  a: SynonymCandidate,
  b: SynonymCandidate,
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

async function step0Reset(vocab: SynonymCandidate[]): Promise<void> {
  console.log('\nStep 0 — Clearing all existing synonyms...')
  const { error } = await supabase
    .from('vocabularies')
    .update({ synonyms: [] })
    .in(
      'id',
      vocab.map((v) => v.id),
    )
  if (error) throw error
  for (const v of vocab) v.synonyms = []
  console.log(`  → Cleared ${vocab.length} words`)
}

async function step1ExactMatch(vocab: SynonymCandidate[]): Promise<void> {
  console.log('\nStep 1 — Exact meaning match (no AI)...')

  const groups = new Map<string, SynonymCandidate[]>()
  for (const v of vocab) {
    const key = normalize(v.meaning)
    const group = groups.get(key) ?? []
    group.push(v)
    groups.set(key, group)
  }

  let updated = 0
  for (const group of groups.values()) {
    if (group.length < 2) continue
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

async function step2PartialMatchWithAI(
  vocab: SynonymCandidate[],
): Promise<void> {
  console.log('\nStep 2 — Partial meaning match → AI verification...')

  const pairs: [SynonymCandidate, SynonymCandidate][] = []
  const seen = new Set<string>()

  for (const v of vocab) {
    for (const candidate of findCandidates(v, vocab)) {
      const key = [v.id, candidate.id].sort().join('|')
      if (!seen.has(key)) {
        seen.add(key)
        pairs.push([v, candidate])
      }
    }
  }

  console.log(`  Found ${pairs.length} candidate pairs for AI review`)

  let confirmed = 0
  let rejected = 0

  for (let i = 0; i < pairs.length; i++) {
    const [a, b] = pairs[i]
    const isSynonym = await checkWithFallback(a, b)

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
        console.log(`  ✓ ${a.word} ↔ ${b.word} (${i + 1}/${pairs.length})`)
        a.synonyms = newSynA
        b.synonyms = newSynB
        confirmed++
      }
    }

    if (i < pairs.length - 1) {
      await new Promise((r) => setTimeout(r, AI_REQUEST_DELAY_MS))
    }
  }

  console.log(`  → AI confirmed: ${confirmed}, rejected: ${rejected}`)
}

async function main(): Promise<void> {
  const { data, error } = await supabase
    .from('vocabularies')
    .select('id, word, word_type, meaning, synonyms')
  if (error) throw error
  if (!data?.length) {
    console.log('No vocabulary found.')
    return
  }

  const vocab = data as SynonymCandidate[]
  console.log(`Loaded ${vocab.length} words.`)

  await step0Reset(vocab)
  await step1ExactMatch(vocab)
  await step2PartialMatchWithAI(vocab)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { tokenize }
