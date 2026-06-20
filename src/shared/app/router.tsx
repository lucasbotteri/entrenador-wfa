import { createHashRouter, Navigate, Outlet } from 'react-router-dom'

import { Shell } from './Shell'

import { learnRoutes } from '@/modules/learn'
import { practiceRoutes } from '@/modules/practice'

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
    children: [...learnRoutes, ...practiceRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
