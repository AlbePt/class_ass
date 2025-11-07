import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../app/providers/ThemeProvider'
import { useSessionStore } from '../../entities/session/store'
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card'
import { Button } from '../../shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select'
import { formatDuration } from '../../shared/lib/formatting'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'settings' })
  const { expiresInSec } = useSessionStore()
  const [dateFormat, setDateFormat] = useState<'dd.MM.yyyy' | 'MM/dd/yyyy'>('dd.MM.yyyy')

  const switchTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const changeLanguage = (lng: 'ru' | 'en') => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('theme')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{theme === 'light' ? 'Светлая' : 'Тёмная'}</span>
          <Button onClick={switchTheme}>Переключить</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={i18n.language as 'ru' | 'en'} onValueChange={changeLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue>{i18n.language}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('dateFormat')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={dateFormat} onValueChange={(value: 'dd.MM.yyyy' | 'MM/dd/yyyy') => setDateFormat(value)}>
            <SelectTrigger className="w-48">
              <SelectValue>{dateFormat}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd.MM.yyyy">dd.MM.yyyy</SelectItem>
              <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('session')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            {t('expires')}: {expiresInSec != null ? formatDuration(expiresInSec, i18n.language as 'ru' | 'en') : 'Нет данных'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
