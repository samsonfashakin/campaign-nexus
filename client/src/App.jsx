import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CharactersPage } from './pages/characters/CharactersPage'
import { CharacterDetailPage } from './pages/characters/CharacterDetailPage'
import { CampaignsPage } from './pages/campaigns/CampaignsPage'
import { CampaignDetailPage } from './pages/campaigns/CampaignDetailPage'
import { EncounterPage } from './pages/campaigns/EncounterPage'

const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/',                                              element: <DashboardPage /> },
          { path: '/characters',                                    element: <CharactersPage /> },
          { path: '/characters/:id',                                element: <CharacterDetailPage /> },
          { path: '/campaigns',                                     element: <CampaignsPage /> },
          { path: '/campaigns/:id',                                 element: <CampaignDetailPage /> },
          { path: '/campaigns/:id/encounters/:encounterId',         element: <EncounterPage /> },
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