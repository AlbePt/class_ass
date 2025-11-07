import { create } from 'zustand'

interface SessionState {
  sessionId: string | null
  expiresInSec: number | null
  setSession: (payload: { sessionId: string; expiresInSec: number }) => void
  clear: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  expiresInSec: null,
  setSession: ({ sessionId, expiresInSec }) => set({ sessionId, expiresInSec }),
  clear: () => set({ sessionId: null, expiresInSec: null })
}))
