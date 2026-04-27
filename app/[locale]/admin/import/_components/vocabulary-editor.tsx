'use client'

import { Loader2, PlusCircle, Trash2 } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { DraftStatus, DraftVocabulary } from '../_hooks/use-import-flow'

interface VocabularyEditorProps {
  vocabularies: DraftVocabulary[]
  isSaving: boolean
  isCheckingDuplicates: boolean
  onUpdate: (id: string, field: keyof DraftVocabulary, value: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onConfirm: () => void
  onBack: () => void
}

const COLUMNS: {
  field: keyof DraftVocabulary
  label: string
  width: string
}[] = [
  { field: 'word', label: 'Từ', width: 'w-28' },
  { field: 'word_type', label: 'Loại', width: 'w-16' },
  { field: 'phonetic', label: 'Phiên âm', width: 'w-28' },
  { field: 'meaning', label: 'Nghĩa', width: 'w-32' },
  { field: 'example', label: 'Ví dụ', width: 'w-48' },
  { field: 'description', label: 'Mô tả', width: '' },
]

const EDITABLE_FIELDS = new Set<keyof DraftVocabulary>(
  COLUMNS.map((c) => c.field),
)

function StatusBadge({ status }: { status?: DraftStatus }) {
  if (!status || status === 'new') return null
  if (status === 'duplicate')
    return (
      <Badge
        variant="secondary"
        className="shrink-0 cursor-default text-[10px]"
        title="Nội dung giống hệt DB — sẽ bỏ qua, không lưu lại"
      >
        Giống DB
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="shrink-0 cursor-default border-amber-500 text-[10px] text-amber-600"
      title="AI phát hiện nội dung khác DB — sẽ tự động cập nhật. Bạn có thể sửa thêm trước khi lưu"
    >
      AI cập nhật
    </Badge>
  )
}

function rowBg(status?: DraftStatus) {
  if (status === 'duplicate') return 'bg-muted/40 opacity-60'
  if (status === 'modified') return 'bg-amber-50/40 dark:bg-amber-950/20'
  return ''
}

export function VocabularyEditor({
  vocabularies,
  isSaving,
  isCheckingDuplicates,
  onUpdate,
  onDelete,
  onAdd,
  onConfirm,
  onBack,
}: VocabularyEditorProps) {
  const newCount = vocabularies.filter(
    (v) => v.word.trim() && v.status !== 'duplicate',
  ).length
  const dupCount = vocabularies.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  ).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {vocabularies.length} từ — chỉnh sửa trước khi lưu
          </p>
          {isCheckingDuplicates && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 size={12} className="animate-spin" />
              Đang so sánh với DB…
            </span>
          )}
          {!isCheckingDuplicates && dupCount > 0 && (
            <span className="text-muted-foreground text-xs">
              ({dupCount} giống DB — bỏ qua,{' '}
              {vocabularies.filter((v) => v.status === 'modified').length} AI
              cập nhật, {newCount} từ mới)
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <PlusCircle size={14} />
          Thêm dòng
        </Button>
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6" />
              {COLUMNS.map((c) => (
                <TableHead key={c.field} className={c.width}>
                  {c.label}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularies.map((v) => (
              <TableRow key={v._id} className={rowBg(v.status)}>
                {/* Status indicator cell */}
                <TableCell className="p-1">
                  <StatusBadge status={v.status} />
                </TableCell>

                {COLUMNS.map((c) => (
                  <TableCell key={c.field} className="p-1">
                    <Input
                      value={String(v[c.field] ?? '')}
                      onChange={(e) => {
                        if (EDITABLE_FIELDS.has(c.field)) {
                          onUpdate(
                            v._id,
                            c.field as keyof DraftVocabulary,
                            e.target.value,
                          )
                        }
                      }}
                      className="focus:bg-background h-8 border-transparent bg-transparent px-2 focus:border-inherit"
                    />
                  </TableCell>
                ))}

                <TableCell className="p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => onDelete(v._id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSaving || newCount === 0}
          title={
            newCount === 0 ? 'Không có từ mới hoặc từ đã chỉnh sửa để lưu' : ''
          }
        >
          {isSaving
            ? 'Đang lưu...'
            : newCount > 0
              ? `Lưu ${newCount} từ vựng`
              : 'Không có từ mới'}
        </Button>
      </div>
    </div>
  )
}
