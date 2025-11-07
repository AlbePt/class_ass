import { LabelPage } from '../../entities/label/types'

interface LabelsPreviewProps {
  pages: LabelPage[]
}

export function LabelsPreview({ pages }: LabelsPreviewProps) {
  if (!pages.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">Нет данных для предпросмотра</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {pages.map((page, index) => (
        <figure key={page.url} className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <figcaption className="mb-2 text-sm text-slate-500">Страница {index + 1}</figcaption>
          <img src={page.url} alt={`Label page ${index + 1}`} className="h-auto w-full rounded-md border border-slate-100 object-contain" />
        </figure>
      ))}
    </div>
  )
}
