import type {
  ExtractedVocabulary,
  TranslationDirection,
  VocabularyFill,
} from './types'

export abstract class BaseAIProvider {
  abstract readonly name: string

  abstract extractVocabulary(
    base64: string,
    mimeType: string,
  ): Promise<ExtractedVocabulary[]>

  suggestTranslation(
    _text: string,
    _direction: TranslationDirection,
  ): Promise<string> {
    return Promise.reject(
      new Error(`${this.name} does not support suggestTranslation`),
    )
  }

  suggestVocabularyFill(_word: string): Promise<VocabularyFill> {
    return Promise.reject(
      new Error(`${this.name} does not support suggestVocabularyFill`),
    )
  }

  checkSynonyms(
    _wordA: string,
    _typeA: string | null,
    _meaningA: string,
    _wordB: string,
    _typeB: string | null,
    _meaningB: string,
  ): Promise<boolean> {
    return Promise.reject(
      new Error(`${this.name} does not support checkSynonyms`),
    )
  }
}
