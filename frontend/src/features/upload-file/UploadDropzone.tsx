import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/ui/button'

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void
}

export function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'upload' })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      if (!file.name.endsWith('.xlsx')) {
        alert('Only XLSX files are supported')
        return
      }
      onFileSelected(file)
    },
    [onFileSelected]
  )

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragOver(false)
        handleFiles(event.dataTransfer?.files ?? null)
      }}
      className={`flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed ${isDragOver ? 'border-primary bg-primary/5' : 'border-slate-300'} text-center`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      aria-label={t('dropzone')}
    >
      <p className="text-lg font-medium">{t('dropzone')}</p>
      <Button className="mt-4" type="button">
        {t('selectFile')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}
