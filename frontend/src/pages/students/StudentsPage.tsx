import { useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { fetchStudents } from '../../entities/student/api'
import type { Student } from '../../entities/student/types'
import { FiltersPanel } from '../../features/filter-panel/FiltersPanel'
import { Table, TableCell, TableHead, TableRow } from '../../shared/ui/table'
import { Skeleton } from '../../shared/ui/skeleton'
import { Button } from '../../shared/ui/button'
import { exportStudentsCsv } from '../../features/export-csv/exportStudentsCsv'
import { Badge } from '../../shared/ui/badge'
import { useTranslation } from 'react-i18next'

export function StudentsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation('translation', { keyPrefix: 'students' })
  const filters = useMemo(
    () => ({
      class: params.get('class') ?? undefined,
      risk: params.get('risk') ?? undefined,
      q: params.get('q') ?? undefined
    }),
    [params]
  )

  const query = useQuery({
    queryKey: ['students', filters],
    queryFn: () => fetchStudents(filters)
  })

  const data = query.data?.items ?? []

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        header: 'ФИО',
        accessorKey: 'fio',
        cell: ({ row }) => (
          <button className="text-left text-primary underline" onClick={() => navigate(`/students/${row.original.id}`)}>
            {row.original.fio}
          </button>
        )
      },
      {
        header: 'Класс',
        accessorKey: 'class'
      },
      {
        header: 'Средний балл',
        accessorKey: 'avg',
        cell: ({ getValue }) => Number(getValue()).toFixed(2)
      },
      {
        header: 'Риск',
        accessorKey: 'risk',
        cell: ({ getValue }) => <Badge variant="warning">{String(getValue())}</Badge>
      }
    ],
    [navigate]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <Button variant="outline" onClick={() => exportStudentsCsv(data)} disabled={!data.length}>
          {t('export')}
        </Button>
      </div>
      <FiltersPanel />
      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 p-6 text-danger">Не удалось загрузить данные</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <p>{t('empty')}</p>
          <Button onClick={() => navigate('/upload')}>Перейти к загрузке</Button>
        </div>
      ) : (
        <div ref={parentRef} className="h-[480px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-slate-100 dark:bg-slate-800">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </thead>
            <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
              {(virtualItems.length > 0 ? virtualItems : table.getRowModel().rows.map((row, index) => ({
                key: row.id,
                index,
                start: index * 56
              }))).map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index]
                return (
                  <TableRow
                    key={row.id}
                    style={{
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`,
                      width: '100%'
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}
