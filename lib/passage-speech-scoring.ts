import { overallScore, scorePassage } from '~/lib/passage-score'

import type { WordResult } from '~/types'

export interface PassageSpeechScore {
  transcript: string
  wordResults: WordResult[]
  pronunciationScore: number
}

interface SpeechScoreResponse {
  transcript: string
  wordResults?: WordResult[]
  pronunciationScore?: number
}

export async function scorePassageAudio(
  audioBlob: Blob,
  passageContent: string,
): Promise<PassageSpeechScore> {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  form.append('expected', passageContent)

  const res = await fetch('/api/speech-score', {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Scoring failed')

  const data = (await res.json()) as SpeechScoreResponse
  const wordResults =
    data.wordResults ?? scorePassage(data.transcript, passageContent)

  return {
    transcript: data.transcript,
    wordResults,
    pronunciationScore: data.pronunciationScore ?? overallScore(wordResults),
  }
}
