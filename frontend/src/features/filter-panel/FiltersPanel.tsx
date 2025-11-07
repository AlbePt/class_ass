import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../shared/ui/button'
import { Badge } from '../../shared/ui/badge'

const risks = ['A', 'B', 'C', 'RISK2']
const classes = ['5A', '6A', '7A', '7B', '8A']

export function FiltersPanel() {
  const [params, setParams] = useSearchParams()
  const selectedRisk = params.get('risk') ?? ''
  const selectedClass = params.get('class') ?? ''

  const activeFilters = useMemo(() => {
    const items: Array<{ label: string; key: string }> = []
    if (selectedRisk) items.push({ label: `Риск: ${selectedRisk}`, key: 'risk' })
    if (selectedClass) items.push({ label: `Класс: ${selectedClass}`, key: 'class' })
    return items
  }, [selectedRisk, selectedClass])

  const toggleParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (next.get(key) === value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setParams(next)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.length > 0 ? (
          activeFilters.map((filter) => <Badge key={filter.key}>{filter.label}</Badge>)
        ) : (
          <span className="text-sm text-slate-500">Фильтры не применены</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {classes.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={selectedClass === item ? 'default' : 'ghost'}
              onClick={() => toggleParam('class', item)}
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {risks.map((risk) => (
            <Button
              key={risk}
              size="sm"
              variant={selectedRisk === risk ? 'default' : 'ghost'}
              onClick={() => toggleParam('risk', risk)}
            >
              {risk}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
