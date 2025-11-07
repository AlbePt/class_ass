export interface Student {
  id: string
  fio: string
  class: string
  avg: number
  risk: 'A' | 'B' | 'C' | 'RISK2'
}

export interface SubjectPerformance {
  name: string
  avg: number
  marks: number[]
}

export interface StudentDetail extends Student {
  subjects: SubjectPerformance[]
  attendance: {
    totalLessons: number
    missed: number
    late: number
  }
  trend: Array<{ date: string; avg: number }>
}
