import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UploadDropzone } from '../../features/upload-file/UploadDropzone'
import { uploadFile, clearSession, getSessionStatus } from '../../entities/session/api'
import { useSessionStore } from '../../entities/session/store'
import { Button } from '../../shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../../shared/ui/badge'

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Awaited<ReturnType<typeof uploadFile>> | null>(null)
  const { t } = useTranslation('translation', { keyPrefix: 'upload' })
  const { setSession, clear } = useSessionStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Файл не выбран')
      const response = await uploadFile(file)
      const status = await getSessionStatus()
      setSession({ sessionId: response.session_id, expiresInSec: status.expires_in_sec })
      setResult(response)
      await queryClient.invalidateQueries()
      return response
    }
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      await clearSession()
      clear()
      setResult(null)
      setFile(null)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-slate-500">Поддерживается формат Microsoft Excel 2007+ (.xlsx).</p>
      </div>
      <UploadDropzone onFileSelected={setFile} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!file || mutation.isPending}>
          {mutation.isPending ? 'Загрузка...' : t('preview')}
        </Button>
        <Button variant="outline" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
          {t('clear')}
        </Button>
        {result && (
          <Button variant="ghost" onClick={() => navigate('/students')}>
            {t('goStudents')}
          </Button>
        )}
      </div>
      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('errors')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.validation.errors.length === 0 ? (
                <Badge variant="success">Нет ошибок</Badge>
              ) : (
                result.validation.errors.map((error) => (
                  <div key={error} className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
                    {error}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('warnings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.validation.warnings.length === 0 ? (
                <Badge variant="warning">Нет предупреждений</Badge>
              ) : (
                result.validation.warnings.map((warning) => (
                  <div key={warning} className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                    {warning}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
