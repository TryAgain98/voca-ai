import { supabase } from '~/lib/supabase'

export class BaseService<
  TRow extends { id: string },
  TInsert = Omit<TRow, 'id'>,
  TUpdate = Partial<TInsert>,
> {
  constructor(protected readonly table: string) {}

  async findAll(): Promise<TRow[]> {
    const { data, error } = await supabase.from(this.table).select('*')
    if (error) throw error
    return data as TRow[]
  }

  async findById(id: string): Promise<TRow> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as TRow
  }

  async create(payload: TInsert): Promise<void> {
    const { error } = await supabase.from(this.table).insert(payload as never)
    if (error) throw error
  }

  async update(id: string, payload: TUpdate): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update(payload as never)
      .eq('id', id)
    if (error) throw error
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }
}
