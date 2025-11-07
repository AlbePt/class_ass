import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentReport, downloadCurrentReport } from '../../entities/report/api'
import { useSelectorsStore } from '../../entities/context/selectorsStore'
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card'
import { Button } from '../../shared/ui/button'
import { Skeleton } from '../../shared/ui/skeleton'
import { Badge } from '../../shared/ui/badge'
import { useTranslation } from 'react-i18next'

export function ReportsPage() {
  const { classroom, quarter } = useSelectorsStore()
  const { t } = useTranslation('translation', { keyPrefix: 'reports' })
  const filters = useMemo(() => ({ class: classroom, quarter }), [classroom, quarter])

  const query = useQuery({
    queryKey: ['report', filters],
    queryFn: () => fetchCurrentReport(filters)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCurrentReport('pdf')}>
            {t('exportPdf')}
          </Button>
          <Button variant="outline" onClick={() => downloadCurrentReport('xlsx')}>
            {t('exportXlsx')}
          </Button>
        </div>
      </div>
      {query.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : query.isError || !query.data ? (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-danger">Не удалось получить отчёт</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('current')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-500">Ученики: {query.data.totals.students}</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(query.data.totals.risks).map(([risk, count]) => (
                  <Badge key={risk} variant="outline">
                    {risk}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('risks')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {query.data.bySubject.map((item) => (
                <div key={item.subject} className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">
                  <span>{item.subject}</span>
                  <span className="font-semibold">{item.average.toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
