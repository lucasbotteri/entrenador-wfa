import { createHashRouter, Navigate, Outlet } from 'react-router-dom'

import { Shell } from './Shell'

import { learnRoutes } from '@/modules/learn'
import { practiceRoutes } from '@/modules/practice'
import { scenariosRoutes } from '@/modules/scenarios'

function Layout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [...learnRoutes, ...practiceRoutes, ...scenariosRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
