import { useEffect, useState } from 'react'
import { useSessionStore } from '../../entities/session/store'
import { useToast } from '../ui/useToast'

const WARNING_THRESHOLD = 120

export function useSessionTimer() {
  const expiresIn = useSessionStore((state) => state.expiresInSec)
  const [remaining, setRemaining] = useState(expiresIn)
  const { toast } = useToast()

  useEffect(() => {
    setRemaining(expiresIn)
  }, [expiresIn])

  useEffect(() => {
    if (expiresIn == null) {
      return
    }

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) {
          return prev
        }
        const next = Math.max(prev - 1, 0)
        if (next === WARNING_THRESHOLD) {
          toast({
            title: 'Сессия скоро завершится',
            description: 'Продлите работу, чтобы не потерять данные.'
          })
        }
        return next
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [toast, expiresIn])

  return remaining
}
