import { Outlet } from 'react-router'

import { Toaster } from '@/components/ui'

import layoutConfig from './config'
import Content from './Content'
import Footer from './Footer'
import { Header } from './header'

export const Layout = () => {
  const { footer, header } = layoutConfig

  return (
    <div className="relative flex min-h-screen w-full flex-col transition-all ease-in">
      {/* 页面头部 */}
      <Header height={header.height} />

      {/* 内容区域 */}
      <Content>
        <Outlet></Outlet>
      </Content>

      {/* 页面底部 */}
      {footer.show && <Footer />}

      {/* 提示组件 */}
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default Layout
