import { create } from 'zustand'

interface SelectorState {
  school: string
  year: string
  classroom: string
  quarter: string
  setSchool: (value: string) => void
  setYear: (value: string) => void
  setClassroom: (value: string) => void
  setQuarter: (value: string) => void
}

const currentYear = new Date().getFullYear().toString()

export const useSelectorsStore = create<SelectorState>((set) => ({
  school: 'School #1',
  year: currentYear,
  classroom: '7A',
  quarter: '1',
  setSchool: (value) => set({ school: value }),
  setYear: (value) => set({ year: value }),
  setClassroom: (value) => set({ classroom: value }),
  setQuarter: (value) => set({ quarter: value })
}))
