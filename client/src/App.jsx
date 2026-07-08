import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CharactersPage } from './pages/characters/CharactersPage'
import { CampaignsPage } from './pages/campaigns/CampaignsPage'

const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/',           element: <DashboardPage /> },
          { path: '/characters', element: <CharactersPage /> },
          { path: '/campaigns',  element: <CampaignsPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}