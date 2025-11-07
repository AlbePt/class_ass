import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card'
import { Button } from '../../shared/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../entities/auth/store'

export function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('translation', { keyPrefix: 'dashboard' })
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{t('welcome', { email: user?.email })}</h1>
        <p className="text-sm text-slate-500">Следите за успеваемостью и рисками в одном месте.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Всего учеников</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">168</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Высокий риск</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-danger">12</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Средний балл</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-success">4.2</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/upload')}>{t('upload')}</Button>
          <Button variant="outline" onClick={() => navigate('/students')}>
            {t('students')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
