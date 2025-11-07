import type { Student } from '../../entities/student/types'

export function exportStudentsCsv(students: Student[]) {
  const header = ['ID', 'ФИО', 'Класс', 'Средний балл', 'Риск']
  const rows = students.map((student) => [student.id, student.fio, student.class, student.avg.toString(), student.risk])
  const csvContent = [header, ...rows].map((row) => row.map((value) => `"${value}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'students.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
