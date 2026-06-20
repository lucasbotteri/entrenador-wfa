import type { RouteObject } from 'react-router-dom'

import { Play } from './routes/Play'
import { ScenariosHome } from './routes/ScenariosHome'

export const scenariosRoutes: RouteObject[] = [
  { path: '/scenarios', element: <ScenariosHome /> },
  { path: '/scenarios/:caseId', element: <Play /> },
]
