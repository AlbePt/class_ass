import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { LoginPage } from '../pages/login/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { UploadPage } from '../pages/upload/UploadPage'
import { StudentsPage } from '../pages/students/StudentsPage'
import { StudentCardPage } from '../pages/student-card/StudentCardPage'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { LabelsPage } from '../pages/labels/LabelsPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { RequireAuth } from './routes/RequireAuth'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'upload',
        element: <UploadPage />
      },
      {
        path: 'students',
        element: <StudentsPage />
      },
      {
        path: 'students/:id',
        element: <StudentCardPage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      },
      {
        path: 'labels',
        element: <LabelsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
])
