import type { RouteObject } from 'react-router-dom'

import { PracticeHome } from './routes/PracticeHome'
import { Session } from './routes/Session'

export const practiceRoutes: RouteObject[] = [
  { path: '/practice', element: <PracticeHome /> },
  { path: '/practice/session', element: <Session /> },
]
