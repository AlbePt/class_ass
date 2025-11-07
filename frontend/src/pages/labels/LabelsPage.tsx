import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createLabelPreview, downloadLabelsPdf } from '../../entities/label/api'
import { LabelsPreview } from '../../features/print-labels/LabelsPreview'
import { Button } from '../../shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select'
import { useSelectorsStore } from '../../entities/context/selectorsStore'
import { useTranslation } from 'react-i18next'

export function LabelsPage() {
  const [mode, setMode] = useState<'all' | 'selected' | 'filtered'>('all')
  const [format, setFormat] = useState<'preview' | 'pdf'>('preview')
  const { classroom } = useSelectorsStore()
  const { t } = useTranslation('translation', { keyPrefix: 'labels' })

  const mutation = useMutation({
    mutationFn: () =>
      createLabelPreview(
        mode === 'filtered'
          ? { filter: { class: classroom } }
          : mode === 'selected'
          ? { studentIds: [] }
          : {}
      )
  })

  const handleDownload = () => {
    const params = new URLSearchParams({ class: classroom })
    downloadLabelsPdf(params)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className="flex gap-2">
          <Select value={mode} onValueChange={(value: 'all' | 'selected' | 'filtered') => setMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue>{mode}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="selected">Выбранные</SelectItem>
              <SelectItem value="filtered">По фильтрам</SelectItem>
            </SelectContent>
          </Select>
          <Select value={format} onValueChange={(value: 'preview' | 'pdf') => setFormat(value)}>
            <SelectTrigger className="w-40">
              <SelectValue>{format}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preview">Предпросмотр</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload}>
            {t('downloadPdf')}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('preview')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Обновить предпросмотр
          </Button>
          <div className="mx-auto aspect-[210/297] w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative rounded-lg border border-dashed border-slate-300 p-4">
                  <span className="text-xs uppercase text-slate-400">Label {index + 1}</span>
                  <div className="absolute inset-x-3 top-1 h-px bg-slate-200" aria-hidden />
                  <div className="absolute inset-y-3 left-1 w-px bg-slate-200" aria-hidden />
                </div>
              ))}
            </div>
          </div>
          {mutation.data && format === 'preview' && <LabelsPreview pages={mutation.data.pages} />}
        </CardContent>
      </Card>
    </div>
  )
}
