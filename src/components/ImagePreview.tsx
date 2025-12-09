import { css } from '@emotion/css'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { PhotoSlider } from 'react-photo-view'

import { useIsMobile } from '@/hooks'
import { cn } from '@/utils'

interface DataType {
  /** 唯一标识 */
  key: number | string
  /** 资源地址 */
  src: string
}

interface ImagePreviewProps {
  /** 当前索引 */
  active: number
  /** 关闭 */
  close: () => void
  /** 图片列表 */
  images: DataType[]
  /** 是否可关闭 */
  maskClosable?: boolean
  /** 背景透明度 */
  maskOpacity?: number
  /** 设置当前索引 */
  setActive: (active: number) => void
  /** 是否可见 */
  visible: boolean
}

const PhotoSliderCss = css`
  user-select: none;
  /* 导航栏 */
  .PhotoView-Slider__BannerWrap {
    height: auto;
    background-color: transparent;
  }
  .PhotoView-Slider__BannerRight {
    flex: 1;
  }
  .PhotoView-Slider__Backdrop {
    backdrop-filter: blur(10px);
    background-color: var(--foreground);
  }

  /* 隐藏默认按钮（页数，关闭，换页） */
  .PhotoView-Slider__toolbarIcon,
  .PhotoView-Slider__Counter,
  .PhotoView-Slider__ArrowLeft,
  .PhotoView-Slider__ArrowRight {
    display: none;
  }
`

interface FullScreenIconProps {
  className?: string
  onClick?: () => void
}

const FullScreenIcon = ({ className, onClick }: FullScreenIconProps) => {
  const [fullscreen, setFullscreen] = useState<boolean>(false)

  useEffect(() => {
    document.onfullscreenchange = () => {
      setFullscreen(Boolean(document.fullscreenElement))
    }
  }, [])

  return (
    <>
      {fullscreen ? (
        <Minimize className={className} onClick={onClick} />
      ) : (
        <Maximize className={className} onClick={onClick} />
      )}
    </>
  )
}

const DotPagination = ({ currentPage = 1, maxDots = 5, totalPages = 26 }) => {
  const isMobile = useIsMobile(448)

  if (isMobile) maxDots = 3

  // 计算要显示的圆点数量
  const dotsToShow = Math.min(maxDots, totalPages)

  const activeDotIndex = useMemo(() => {
    if (totalPages <= maxDots) {
      return currentPage - 1
    }

    const progress = (currentPage - 1) / (totalPages - 1)
    return Math.round(progress * (dotsToShow - 1))
  }, [dotsToShow, currentPage, maxDots, totalPages])

  return (
    <div
      className={cn(
        'bg-accent-foreground flex h-10 items-center gap-2.5 rounded-full px-6 transition-all duration-300',
        isMobile && 'px-4'
      )}
    >
      {/* 圆点指示器 */}
      <div className="flex gap-1">
        {Array.from({ length: dotsToShow }, (_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{
              opacity: index === activeDotIndex ? 1 : 0.6,
              scale: index === activeDotIndex ? 1.25 : 1
            }}
            transition={{
              damping: 20,
              duration: 0.3,
              stiffness: 300,
              type: 'spring'
            }}
            className={cn(
              'size-1.5 rounded-full',
              index === activeDotIndex ? 'bg-primary' : 'bg-primary-foreground'
            )}
          />
        ))}
      </div>

      {/* 页码数量 */}
      <div className="text-accent flex -translate-y-px items-center gap-1 text-base font-medium">
        <div className="current-page">{currentPage}</div>
        <div className="divider">/</div>
        <div className="total-page">{totalPages}</div>
      </div>
    </div>
  )
}

export const ImagePreview = memo((options: ImagePreviewProps) => {
  const {
    active,
    close,
    images,
    maskClosable = true,
    maskOpacity = 0.75,
    setActive,
    visible = false
  } = options

  const isMobile = useIsMobile(448)

  const activePage = useMemo(() => {
    return active + 1
  }, [active])
  const totalPage = useMemo(() => {
    return images.length
  }, [images])

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      const previewElement = document.querySelector('.PhotoView-Portal')
      if (previewElement) {
        previewElement.requestFullscreen()
      }
    }
  }, [])

  return (
    <>
      <PhotoSlider
        images={images}
        visible={visible}
        index={active}
        onIndexChange={setActive}
        onClose={close}
        maskOpacity={maskOpacity}
        maskClosable={maskClosable}
        speed={() => 300}
        className={PhotoSliderCss}
        easing={() => 'cubic-bezier(0.4, 0, 0.2, 1)'}
        overlayRender={({ index, onIndexChange }) =>
          totalPage > 1 && (
            <>
              {/* 左右换页箭头 */}
              <motion.div
                initial={{ x: -3 }}
                animate={{ x: -3 }}
                whileHover={{ x: 0 }}
                whileTap={{ x: -3 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'preview-prev-page bg-accent-foreground text-accent absolute left-0 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-tr-md rounded-br-md pl-[3px]',
                  isMobile ? 'bottom-3' : 'top-1/2'
                )}
                onClick={() => onIndexChange(index - 1)}
              >
                <ChevronLeft className="size-7" />
              </motion.div>
              <motion.div
                initial={{ x: 3 }}
                animate={{ x: 3 }}
                whileHover={{ x: 0 }}
                whileTap={{ x: 3 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'preview-next-page bg-accent-foreground text-accent absolute right-0 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-tl-md rounded-bl-md pr-[3px]',
                  isMobile ? 'bottom-3' : 'top-1/2'
                )}
                onClick={() => onIndexChange(index + 1)}
              >
                <ChevronRight className="size-7" />
              </motion.div>
            </>
          )
        }
        toolbarRender={({ onClose, onRotate, onScale, rotate, scale }) => (
          <>
            {/* 头部导航栏 */}
            <div className="preview-navbar flex size-full items-center justify-between px-3 pt-3">
              {totalPage > 1 ? (
                <DotPagination
                  currentPage={activePage}
                  totalPages={totalPage}
                />
              ) : (
                <i />
              )}
              <div className="bg-accent-foreground text-accent flex h-11 items-center gap-2.5 rounded-full px-3.5">
                <motion.div
                  whileHover={{ rotate: -30, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                >
                  <RotateCcw
                    className="size-6 cursor-pointer"
                    onClick={() => onRotate(rotate - 90)}
                  />
                </motion.div>
                <motion.div
                  whileHover={{ rotate: 30, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                >
                  <RotateCw
                    className="size-6 cursor-pointer"
                    onClick={() => onRotate(rotate + 90)}
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                >
                  <ZoomOut
                    className="size-6 cursor-pointer"
                    onClick={() => onScale(scale - 0.5)}
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                >
                  <ZoomIn
                    className="size-6 cursor-pointer"
                    onClick={() => onScale(scale + 0.5)}
                  />
                </motion.div>
                {!isMobile && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                  >
                    <FullScreenIcon
                      className="size-6 cursor-pointer"
                      onClick={toggleFullScreen}
                    />
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ damping: 20, stiffness: 300, type: 'spring' }}
                >
                  <X
                    className="size-6 cursor-pointer"
                    onClick={() => onClose()}
                  />
                </motion.div>
              </div>
            </div>
          </>
        )}
      />
    </>
  )
})

export const useImagePreview = () => {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [])

  const handleOpen = useCallback((active: number = 0) => {
    setActive(active)
    setVisible(true)
  }, [])

  return { active, handleClose, handleOpen, setActive, setVisible, visible }
}
