import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { Fragment } from 'react/jsx-runtime'

import router from './router'
import { useUserStore } from './store'

function App() {
  const { initUserInfo } = useUserStore()

  useEffect(() => {
    //  初始化用户信息
    initUserInfo()
  }, [initUserInfo])

  return (
    <Fragment>
      <RouterProvider router={router}></RouterProvider>
    </Fragment>
  )
}

export default App
