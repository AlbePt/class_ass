import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchStudent } from '../../entities/student/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs'
import { Table, TableCell, TableHead, TableRow } from '../../shared/ui/table'
import { Badge } from '../../shared/ui/badge'
import { Button } from '../../shared/ui/button'
import { createLabelPreview } from '../../entities/label/api'
import { Skeleton } from '../../shared/ui/skeleton'

export function StudentCardPage() {
  const { id } = useParams<{ id: string }>()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const query = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudent(id!),
    enabled: Boolean(id)
  })

  const mutation = useMutation({
    mutationFn: () => createLabelPreview({ studentIds: id ? [id] : [] })
  })

  const student = query.data

  useEffect(() => {
    if (!student || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const max = Math.max(...student.trend.map((point) => point.avg), 5)
    ctx.strokeStyle = '#1E63FF'
    ctx.lineWidth = 2
    ctx.beginPath()
    student.trend.forEach((point, index) => {
      const x = (index / (student.trend.length - 1 || 1)) * (width - 20) + 10
      const y = height - (point.avg / max) * (height - 20) - 10
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [student])

  if (query.isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (query.isError || !student) {
    return <div className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-danger">Ученик не найден</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{student.fio}</h1>
          <p className="text-sm text-slate-500">{student.class}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning">{student.risk}</Badge>
          <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/reports/current.pdf`, '_blank')}>
            PDF
          </Button>
          <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/reports/current.xlsx`, '_blank')}>
            XLSX
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Сформировать этикетку
          </Button>
        </div>
      </div>
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Успеваемость</TabsTrigger>
          <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
          <TabsTrigger value="trend">Динамика</TabsTrigger>
          <TabsTrigger value="label">Этикетка</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Table>
            <thead>
              <TableRow>
                <TableHead>Предмет</TableHead>
                <TableHead>Средний балл</TableHead>
                <TableHead>Оценки</TableHead>
              </TableRow>
            </thead>
            <tbody>
              {student.subjects.map((subject) => (
                <TableRow key={subject.name}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.avg.toFixed(2)}</TableCell>
                  <TableCell>{subject.marks.join(', ')}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TabsContent>
        <TabsContent value="attendance" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-4 text-center text-sm font-medium dark:bg-slate-800">Всего уроков: {student.attendance.totalLessons}</div>
            <div className="rounded-lg bg-warning/10 p-4 text-center text-sm font-medium text-warning">Пропущено: {student.attendance.missed}</div>
            <div className="rounded-lg bg-warning/10 p-4 text-center text-sm font-medium text-warning">Опозданий: {student.attendance.late}</div>
          </div>
        </TabsContent>
        <TabsContent value="trend" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <canvas ref={canvasRef} width={600} height={280} className="w-full" aria-label="Academic trend chart" />
        </TabsContent>
        <TabsContent value="label" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {mutation.data ? (
            <img src={mutation.data.pages[0]?.url} alt="Предпросмотр этикетки" className="mx-auto h-64 w-auto rounded-lg border border-slate-200 object-contain" />
          ) : (
            <p className="text-sm text-slate-500">Нажмите «Сформировать этикетку», чтобы получить превью.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
