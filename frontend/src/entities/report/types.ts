export interface ReportSummary {
  totals: {
    students: number
    risks: Record<string, number>
  }
  bySubject: Array<{
    subject: string
    average: number
  }>
}
