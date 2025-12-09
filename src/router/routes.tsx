import type { RouteObject } from 'react-router'

import { Layout } from '@/layouts'
import { Login, Upload, Welcome } from '@/pages'

import { GuardRouter } from './guard'

const LayoutRoute = (children: RouteObject[]) => ({
  path: '/',
  element: (
    <GuardRouter>
      <Layout />
    </GuardRouter>
  ),
  children
})

const createRoutes = (children: RouteObject[]) => [LayoutRoute(children)]

const routes = createRoutes([
  {
    path: '/',
    element: <Welcome />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/upload',
    element: <Upload />
  }
])

export default routes
