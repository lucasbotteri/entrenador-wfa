import type { RouteObject } from 'react-router-dom'

import { ChainMap } from './routes/ChainMap'
import { NodeDetail } from './routes/NodeDetail'
import { QuickRef } from './routes/QuickRef'
import { WorkedExample } from './routes/WorkedExample'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <ChainMap /> },
  { path: '/chain/:nodeId', element: <NodeDetail /> },
  { path: '/example', element: <WorkedExample /> },
  { path: '/quickref', element: <QuickRef /> },
]
