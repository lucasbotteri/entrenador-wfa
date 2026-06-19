import { createHashRouter, Navigate, Outlet } from 'react-router-dom'

import { Shell } from './Shell'

import { learnRoutes } from '@/modules/learn'

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
    children: [...learnRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
