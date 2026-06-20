import type { RouteObject } from 'react-router-dom'

import { ChainMap } from './routes/ChainMap'
import { NodeDetail } from './routes/NodeDetail'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <ChainMap /> },
  { path: '/chain/:nodeId', element: <NodeDetail /> },
]
