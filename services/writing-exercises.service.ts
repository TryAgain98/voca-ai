import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type {
  WritingExercise,
  WritingExerciseInsert,
  WritingExerciseUpdate,
} from '~/types'

class WritingExercisesService extends BaseService<
  WritingExercise,
  WritingExerciseInsert,
  WritingExerciseUpdate
> {
  constructor() {
    super('writing_exercises')
  }

  override async findAll(): Promise<WritingExercise[]> {
    const { data, error } = await supabase
      .from('writing_exercises')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as WritingExercise[]
  }

  async findByUser(userId: string): Promise<WritingExercise[]> {
    const { data, error } = await supabase
      .from('writing_exercises')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as WritingExercise[]
  }

  async uploadImage(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('writing-images')
      .upload(path, file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('writing-images').getPublicUrl(path)
    return data.publicUrl
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const url = new URL(imageUrl)
    const parts = url.pathname.split('/writing-images/')
    if (parts.length < 2) return
    const path = parts[1]
    await supabase.storage.from('writing-images').remove([path])
  }
}

export const writingExercisesService = new WritingExercisesService()
