import { formatDistanceStrict } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

type LocaleKey = 'ru' | 'en'

export function formatDuration(seconds: number, locale: LocaleKey = 'ru') {
  const end = new Date(Date.now() + seconds * 1000)
  return formatDistanceStrict(end, new Date(), {
    roundingMethod: 'floor',
    unit: 'second',
    locale: locale === 'ru' ? ru : enUS
  })
}
