import { motion, MotionConfig } from 'framer-motion'

import { ANIMATION_EASE } from '@/constants'

const Transition = ({
  children,
  disableEnterAnimation
}: {
  children: React.ReactNode
  disableEnterAnimation?: boolean
}) => {
  return (
    <MotionConfig transition={{ ease: ANIMATION_EASE }}>
      <motion.div
        initial={{ opacity: disableEnterAnimation ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

export default Transition
