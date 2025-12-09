import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'

import { ANIMATION_EASE } from '@/constants'
import { cn } from '@/utils'

interface Props {
  alt?: string
  animation?: boolean
  className?: string
  imageClassName?: string
  imageStyle?: React.CSSProperties
  lazyLoad?: boolean
  objectFit?: 'contain' | 'cover'
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
  placeholder?: boolean
  sizes?: string
  src?: string
  srcSet?: string
}

const Image = ({
  alt,
  animation = true,
  className,
  imageClassName,
  imageStyle,
  lazyLoad = true,
  objectFit = 'cover',
  onClick,
  placeholder = true,
  sizes,
  src,
  srcSet
}: Props) => {
  const [error, setError] = useState(false)
  const animate = useAnimation()
  const placeholderAnimate = useAnimation()
  const isAnimate = animation
  useEffect(() => setError(false), [src])

  const onLoad = async () => {
    if (isAnimate) {
      animate.start({ opacity: 1 })
      placeholderAnimate.start({ opacity: 0 })
    }
  }
  const onError = () => {
    console.log(`🚀 error:`, error)
    setError(true)
  }

  const transition = { duration: 0.6, ease: ANIMATION_EASE }
  const motionProps = isAnimate
    ? {
        animate,
        exit: { opacity: 0 },
        initial: { opacity: 0 },
        transition
      }
    : {}
  const placeholderMotionProps = isAnimate
    ? {
        animate: placeholderAnimate,
        exit: { opacity: 0 },
        initial: { opacity: 1 },
        transition
      }
    : {}

  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden',
        className,
        className?.includes('absolute') === false && 'relative'
      )}
    >
      {/* Image */}
      <AnimatePresence>
        <motion.img
          className={cn('absolute inset-0 size-full', imageClassName)}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          style={{ objectFit, ...imageStyle }}
          alt={alt}
          decoding="async"
          loading={lazyLoad ? 'lazy' : undefined}
          onError={onError}
          onLoad={onLoad}
          {...motionProps}
        />
      </AnimatePresence>

      {/* Placeholder / Error fallback */}
      <AnimatePresence>
        {placeholder && (
          <motion.div
            {...placeholderMotionProps}
            className="absolute inset-0 size-full bg-black/10 dark:bg-white/10"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Image
