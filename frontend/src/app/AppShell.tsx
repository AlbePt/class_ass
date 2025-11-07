import { Outlet, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { LayoutDashboard, Upload, Users, FileBarChart2, Tag, Settings, LogOut } from 'lucide-react'
import { Input } from '../shared/ui/input'
import { Button } from '../shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/ui/select'
import { useSelectorsStore } from '../entities/context/selectorsStore'
import { useDebounce } from '../shared/hooks/useDebounce'
import { useSessionTimer } from '../shared/hooks/useSessionTimer'
import { useSessionStore } from '../entities/session/store'
import { formatDuration } from '../shared/lib/formatting'
import { useAuthStore } from '../entities/auth/store'
import { logout } from '../entities/auth/api'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/upload', icon: Upload, labelKey: 'nav.upload' },
  { to: '/students', icon: Users, labelKey: 'nav.students' },
  { to: '/reports', icon: FileBarChart2, labelKey: 'nav.reports' },
  { to: '/labels', icon: Tag, labelKey: 'nav.labels' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' }
]

export function AppShell() {
  const { t, i18n } = useTranslation()
  const { school, year, classroom, quarter, setSchool, setYear, setClassroom, setQuarter } = useSelectorsStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const debounced = useDebounce(search, 300)
  const navigate = useNavigate()
  const remaining = useSessionTimer()
  const { expiresInSec, clear } = useSessionStore()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    if (debounced !== search) {
      const params = new URLSearchParams(searchParams)
      if (debounced) params.set('q', debounced)
      else params.delete('q')
      setSearchParams(params)
    }
  }, [debounced, search, searchParams, setSearchParams])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="flex items-center gap-2">
          <img src={new URL('../shared/assets/logo.svg', import.meta.url).href} alt="Class Assistant" className="h-10 w-10" />
          <span className="text-lg font-semibold">{t('app.title')}</span>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" className="mt-6 flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('app.logout')}
        </Button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="container-page flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Select value={school} onValueChange={setSchool}>
                  <SelectTrigger>
                    <SelectValue>{school}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School #1">School #1</SelectItem>
                    <SelectItem value="School #2">School #2</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue>{year}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(new Date().getFullYear())}>{new Date().getFullYear()}</SelectItem>
                    <SelectItem value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={classroom} onValueChange={setClassroom}>
                  <SelectTrigger>
                    <SelectValue>{classroom}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7A">7A</SelectItem>
                    <SelectItem value="7B">7B</SelectItem>
                    <SelectItem value="8A">8A</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger>
                    <SelectValue>{quarter}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative min-w-[240px] flex-1">
                <Input
                  value={search}
                  onChange={(event) => {
                    const next = event.target.value
                    const params = new URLSearchParams(searchParams)
                    if (next) params.set('q', next)
                    else params.delete('q')
                    setSearchParams(params)
                  }}
                  placeholder={t('app.searchPlaceholder') ?? ''}
                  aria-label={t('app.searchPlaceholder') ?? ''}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {remaining != null && expiresInSec != null ? (
                <span className="text-sm text-slate-500">
                  {t('app.session', { time: formatDuration(remaining, i18n.language as 'ru' | 'en') })}
                </span>
              ) : (
                <span className="text-sm text-slate-400">Нет активной сессии</span>
              )}
              {user && <span className="text-sm text-slate-600">{user.email}</span>}
            </div>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 dark:bg-slate-950">
          <div className="container-page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
