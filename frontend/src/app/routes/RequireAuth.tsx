import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AppShell } from '../AppShell'
import { fetchMe } from '../../entities/auth/api'
import { useAuthStore } from '../../entities/auth/store'
import { getSessionStatus } from '../../entities/session/api'
import { useSessionStore } from '../../entities/session/store'
import { Skeleton } from '../../shared/ui/skeleton'

export function RequireAuth() {
  const { user, setUser } = useAuthStore()
  const { setSession } = useSessionStore()
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    if (user) {
      setLoading(false)
      return
    }

    let isMounted = true
    async function bootstrap() {
      try {
        const me = await fetchMe()
        if (!isMounted) return
        setUser(me)
        try {
          const status = await getSessionStatus()
          if (isMounted) {
            setSession({ sessionId: status.session_id, expiresInSec: status.expires_in_sec })
          }
        } catch (error) {
          console.error(error)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [setSession, setUser, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}
