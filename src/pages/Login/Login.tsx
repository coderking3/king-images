import type { Variants } from 'framer-motion'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import CertificatePanel from './CertificatePanel'
import LoginToggleButton from './LoginToggleButton'
import QrcodePanel from './QrcodePanel'

// 定义卡片翻转动画变体
const cardVariants: Variants = {
  animate: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      damping: 18, // 阻尼，值越小弹性越大
      duration: 0.3, // 动画持续时间，秒为单位
      stiffness: 300, // 弹簧刚度，值越小动画越柔和缓慢
      type: 'spring'
    }
  },
  exit: (isQrcode: boolean) => ({
    opacity: 0,
    rotateY: isQrcode ? 90 : -90,
    scale: 0.85,
    transition: {
      damping: 18, // 阻尼，值越小弹性越大
      duration: 0.2, // 动画持续时间，秒为单位
      stiffness: 300, // 弹簧刚度，值越小动画越柔和缓慢
      type: 'spring'
    }
  }),
  initial: (isQrcode: boolean) => ({
    opacity: 0,
    rotateY: isQrcode ? -90 : 90,
    scale: 0.85
  })
}

type LoginMethod = 'certificate' | 'qrcode'

const LOGIN_METHOD = 'login/method'
const getCacheLoginMethod = (): LoginMethod | null => {
  const method = sessionStorage.getItem(LOGIN_METHOD)
  return method as LoginMethod | null
}
const setCacheLoginMethod = (method: LoginMethod) => {
  sessionStorage.setItem(LOGIN_METHOD, method)
}

function Login() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(
    getCacheLoginMethod() || 'qrcode'
  )

  const toggleLoginMethod = (method: LoginMethod) => {
    setLoginMethod(method)
    setCacheLoginMethod(method)
  }

  return (
    <div className="@container relative flex size-full flex-1 items-center justify-center">
      <AnimatePresence initial={false} mode="sync">
        {loginMethod === 'certificate' ? (
          <motion.div
            className="absolute w-full max-w-[440px] @max-md:max-w-full @max-md:px-4"
            key="certificate"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CertificatePanel
              toggleButton={
                <LoginToggleButton
                  methodType={'qrcode'}
                  toggleLoginMethod={toggleLoginMethod}
                />
              }
            ></CertificatePanel>
          </motion.div>
        ) : (
          <motion.div
            className="absolute w-full max-w-[440px] @max-md:max-w-full @max-md:px-4"
            key="qrcode"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <QrcodePanel
              toggleButton={
                <LoginToggleButton
                  methodType={'certificate'}
                  toggleLoginMethod={toggleLoginMethod}
                />
              }
            ></QrcodePanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
