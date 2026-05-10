import { supabase } from '~/lib/supabase'
import { findCandidates, normalize } from '~/lib/synonym-matcher'
import { AnthropicProvider, GroqProvider, OpenAIProvider } from '~/providers/ai'

import type { SynonymCandidate } from '~/lib/synonym-matcher'
import type { BaseAIProvider } from '~/providers/ai'
import type { Vocabulary } from '~/types'

const providers: BaseAIProvider[] = [
  new GroqProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
]

async function checkWithFallback(
  a: SynonymCandidate,
  b: SynonymCandidate,
): Promise<boolean> {
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
    } catch {
      continue
    }
  }
  return false
}

async function persistSynonymPair(
  a: SynonymCandidate,
  b: SynonymCandidate,
): Promise<void> {
  const newSynA = [...new Set([...a.synonyms, normalize(b.word)])]
  const newSynB = [...new Set([...b.synonyms, normalize(a.word)])]

  const [resA, resB] = await Promise.all([
    supabase.from('vocabularies').update({ synonyms: newSynA }).eq('id', a.id),
    supabase.from('vocabularies').update({ synonyms: newSynB }).eq('id', b.id),
  ])

  if (resA.error) throw resA.error
  if (resB.error) throw resB.error

  a.synonyms = newSynA
  b.synonyms = newSynB
}

async function fetchAllVocab(): Promise<SynonymCandidate[]> {
  const { data, error } = await supabase
    .from('vocabularies')
    .select('id, word, word_type, meaning, synonyms')
  if (error) throw error
  return (data ?? []) as SynonymCandidate[]
}

function isExactMatch(a: SynonymCandidate, b: SynonymCandidate): boolean {
  return normalize(a.meaning) === normalize(b.meaning)
}

async function removeSynonymReference(
  vocabId: string,
  wordToRemove: string,
): Promise<void> {
  const { data } = await supabase
    .from('vocabularies')
    .select('id, synonyms')
    .eq('id', vocabId)
    .single()
  if (!data) return
  const updated = (data.synonyms as string[]).filter(
    (s) => normalize(s) !== normalize(wordToRemove),
  )
  await supabase
    .from('vocabularies')
    .update({ synonyms: updated })
    .eq('id', vocabId)
}

class SynonymSyncService {
  async cleanAndSyncForVocabId(vocabId: string): Promise<void> {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('id', vocabId)
      .single()
    if (error || !data) return

    const vocab = data as Vocabulary

    // Remove this word from all its old synonyms' lists
    await Promise.all(
      vocab.synonyms.map((synWord) =>
        supabase
          .from('vocabularies')
          .select('id')
          .eq('word', synWord)
          .single()
          .then(({ data: synData }) => {
            if (synData) {
              return removeSynonymReference(
                (synData as { id: string }).id,
                vocab.word,
              )
            }
          }),
      ),
    )

    // Clear this vocab's own synonyms
    await supabase
      .from('vocabularies')
      .update({ synonyms: [] })
      .eq('id', vocabId)
    vocab.synonyms = []

    // Re-sync with new meaning
    await this.syncForVocab(vocab)
  }

  async syncForVocab(vocab: Vocabulary): Promise<void> {
    const all = await fetchAllVocab()
    console.log(
      `[syncForVocab] "${vocab.word}" | meaning="${vocab.meaning}" | pool=${all.length}`,
    )

    for (const candidate of all) {
      if (candidate.id === vocab.id) continue
      if (vocab.synonyms.includes(normalize(candidate.word))) continue

      const exact = isExactMatch(vocab, candidate)
      console.log(
        `  checking "${candidate.word}" | meaning="${candidate.meaning}" | exact=${exact}`,
      )

      if (exact) {
        console.log(`  → exact match, persisting pair`)
        await persistSynonymPair(vocab, candidate)
        continue
      }

      const partialCandidates = findCandidates(vocab, [candidate])
      if (partialCandidates.length > 0) {
        const isSynonym = await checkWithFallback(vocab, candidate)
        console.log(`  → AI says: ${isSynonym}`)
        if (isSynonym) await persistSynonymPair(vocab, candidate)
      }
    }
  }

  async syncForVocabs(vocabs: Vocabulary[]): Promise<void> {
    const all = await fetchAllVocab()

    for (const vocab of vocabs) {
      for (const candidate of all) {
        if (candidate.id === vocab.id) continue
        if (vocab.synonyms.includes(normalize(candidate.word))) continue

        if (isExactMatch(vocab, candidate)) {
          await persistSynonymPair(vocab, candidate)
          continue
        }

        const partialCandidates = findCandidates(vocab, [candidate])
        if (partialCandidates.length > 0) {
          const isSynonym = await checkWithFallback(vocab, candidate)
          if (isSynonym) await persistSynonymPair(vocab, candidate)
        }
      }
    }
  }
}

export const synonymSyncService = new SynonymSyncService()
