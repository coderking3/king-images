import type { ImageInfo } from '@/types'

import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { CircleHelp, Copy, ImageOff, X, ZoomIn } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ImagePreview, useImagePreview } from '@/components'
import Image from '@/components/Image'
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'
import { imagesTable } from '@/db'
import { useIsMobile } from '@/hooks'
import { cn, copyToClipboard, toMarkdown, toWebp } from '@/utils'
// import { toast } from 'sonner'

// 添加格式配置状态
type FormatType = 'custom' | 'markdown' | 'original' | 'webp'

// 计算图片的宽高比
function calculateImageRatio(image: ImageInfo): string {
  const ratio = image.width / image.height

  // 判断比例并返回对应的字符串表示
  if (ratio >= 0.9 && ratio <= 1.1) {
    return '1/1' // 正方形
  } else if (ratio >= 1.25 && ratio <= 1.42) {
    return '4/3' // 4:3
  } else if (ratio >= 0.7 && ratio <= 0.85) {
    return '3/4' // 3:4
  } else if (ratio >= 1.8 && ratio <= 2.2) {
    return '2/1' // 2:1
  } else if (ratio >= 1.4 && ratio <= 1.6) {
    return '3/2' // 3:2
  } else if (ratio >= 0.45 && ratio <= 0.55) {
    return '1/2' // 1:2
  } else if (ratio >= 0.6 && ratio <= 0.7) {
    return '2/3' // 2:3
  } else {
    // 其他比例默认返回最接近的标准比例
    if (ratio > 1) {
      return ratio > 1.5 ? '2/1' : '4/3'
    } else {
      return ratio > 0.6 ? '3/4' : '1/2'
    }
  }
}

// 根据图片比例获取span (宽:高)
function getImageSpan(ratio: string) {
  // 根据宽高比确定布局
  switch (ratio) {
    case '1/1':
    case '4/3':
    case '3/4':
      // 接近正方形 1:1 (包括4:3和3:4)
      return 'col-span-1 row-span-1 aspect-square'
    case '2/1':
    case '3/2':
      // 宽图 (宽度大于高度)
      return 'col-span-2 row-span-1 aspect-[2/1]'
    case '1/2':
    case '2/3':
      // 长图 (高度大于宽度)
      return 'col-span-1 row-span-2 aspect-[1/2]'
    default:
      // 其他比例默认为小正方形
      return 'col-span-1 row-span-1 aspect-square'
  }
}

const FormatHelpIcon = memo(() => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="text-popover-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer rounded-full p-1 transition-colors">
          <CircleHelp className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-120" side="left">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">图片格式配置说明</h4>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              格式：(图像原链接)@(\d+[whsepqoc]\_?)\*(\.(|webp|gif|png|jpg|jpeg))?$
            </p>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">w:[1, 999+]</span>
                  <span className="text-muted-foreground">
                    (width，图像宽度)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">h:[1, 999+]</span>
                  <span className="text-muted-foreground">
                    (height，图像高度)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">s:[1, 999+]</span>
                  <span className="text-muted-foreground">(作用未知)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">e:[0,2]</span>
                  <span className="text-muted-foreground">(resize参数)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">p:[1,1000]</span>
                  <span className="text-muted-foreground">(放大倍数)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">q:[1,100]</span>
                  <span className="text-muted-foreground">(图像质量)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">o:[0,1]</span>
                  <span className="text-muted-foreground">(作用未知)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-medium">c:[0,1]</span>
                  <span className="text-muted-foreground">(裁剪参数)</span>
                </div>
              </div>
              <div className="border-border mt-2 border-t pt-2">
                <p className="text-muted-foreground">
                  e参数: 0=保留比例取其小, 1=保留比例取其大, 2=不保留原比例
                </p>
                <p className="text-muted-foreground">
                  格式后缀: webp, png, jpeg, gif (不加则保留原格式)
                </p>
                <p className="text-muted-foreground">
                  参数不区分大小写，相同参数后面覆盖前面
                </p>
                <p className="text-muted-foreground">
                  计算后的实际w*h不能大于原w*h，否则参数失效
                </p>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

interface GalleryList {
  aspectRatio: string
  compressSrc: string
  key: string
  name: string
  src: string
}

interface GalleryListProps {
  handleCopyImage: (name: string, url: string) => void
  handleOpenPreview: (index: number) => void
  images: GalleryList[]
}

const GalleryList = memo((props: GalleryListProps) => {
  const isMobile = useIsMobile(448)

  const { handleCopyImage, handleOpenPreview, images } = props
  const [openPopoverId, setOpenPopoverId] = useState<null | string>(null)

  const handleRemoveImage = useCallback((key: string) => {
    imagesTable.delete(key)
    setOpenPopoverId(null)
  }, [])

  return (
    <div
      className="relative z-10 max-h-[500px] transform-gpu overflow-y-auto overscroll-contain scroll-smooth will-change-scroll"
      style={{
        contain: 'layout style paint',
        overscrollBehavior: 'contain',
        transform: 'translate3d(0, 0, 0)',
        WebkitOverflowScrolling: 'touch',
        willChange: 'scroll-position'
      }}
    >
      <div
        className="grid w-full grid-flow-row-dense grid-cols-2 gap-2 will-change-transform md:grid-cols-4 lg:grid-cols-6"
        style={{
          contain: 'layout style paint',
          isolation: 'isolate'
        }}
      >
        {images.map((item, index) => (
          <div
            key={item.key}
            className={cn(
              'group relative size-full transform-gpu overflow-hidden',
              getImageSpan(item.aspectRatio)
            )}
            style={{
              contain: 'layout style paint',
              isolation: 'isolate',
              transform: 'translateZ(0)'
            }}
          >
            <Image
              key={item.key}
              src={item.compressSrc}
              alt={item.name}
              className={'lg:rounded-24 size-full rounded-md'}
              imageStyle={{
                backfaceVisibility: 'hidden',
                imageRendering: 'auto',
                transform: 'translateZ(0)'
              }}
            />
            {/* 图片操作 */}
            <motion.div
              className="supports-[backdrop-filter]:bg-foreground/30 lg:rounded-24 absolute inset-0 justify-between rounded-md backdrop-blur transition-opacity"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              {...(isMobile
                ? {
                    onMouseEnter: (e) => {
                      e.stopPropagation()
                      e.currentTarget.style.opacity = '1'
                    },
                    onMouseLeave: (e) => {
                      e.stopPropagation()
                      e.currentTarget.style.opacity = '0'
                    }
                  }
                : {})}
              transition={{ duration: 0.2 }}
            >
              {/* 按钮操作 */}
              <motion.div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-4">
                {/* 预览按钮 */}
                <motion.button
                  className="text-k-primary-foreground bg-k-primary-foreground/30 rounded-full p-2 backdrop-blur"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleOpenPreview(index)}
                >
                  <ZoomIn className="size-6" strokeWidth={2.5} />
                </motion.button>
                {/* 复制按钮 */}
                <motion.button
                  className="text-k-primary-foreground bg-k-primary-foreground/30 rounded-full p-2 backdrop-blur"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCopyImage(item.name, item.src)}
                >
                  <Copy className="size-6" strokeWidth={2.5} />
                </motion.button>
              </motion.div>
              {/* 删除按钮 */}
              <Popover
                open={openPopoverId === item.key}
                onOpenChange={(open) =>
                  open ? setOpenPopoverId(item.key) : setOpenPopoverId(null)
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    className="!text-k-primary-foreground absolute top-2 right-2 size-6 rounded-full bg-red-500 hover:bg-red-600"
                    variant="ghost"
                    size="icon"
                  >
                    <X className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">确认删除此图片？</p>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setOpenPopoverId(null)}
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 bg-red-500 hover:bg-red-600"
                        onClick={() => handleRemoveImage(item.key)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 图片名称 */}
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <div className="text-k-primary-foreground absolute bottom-2 w-full truncate px-2 text-xs">
                    {item.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
})

interface FormatConfigProps {
  formatType: FormatType
  onFormatChange: (formatType: FormatType, customSuffix: string) => void
}

const FormatConfig = memo((props: FormatConfigProps) => {
  const { formatType, onFormatChange } = props
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [localFormatType, setLocalFormatType] = useState<FormatType>(formatType)
  const [customSuffix, setCustomSuffix] = useState('')

  // 格式示例文本
  const formatExample = useMemo(() => {
    const url = '${url}'
    switch (localFormatType) {
      case 'original':
        return url
      case 'webp':
        return `${url}@1e_1c.webp`
      case 'markdown':
        return `![alt](${url})`
      case 'custom':
        return `${url}${customSuffix}`
      default:
        return url
    }
  }, [localFormatType, customSuffix])

  // 当点击确认按钮时，将更改应用到父组件
  const handleConfirm = useCallback(() => {
    onFormatChange(localFormatType, customSuffix)
    setPopoverOpen(false)
  }, [localFormatType, customSuffix, onFormatChange])

  // 当打开弹窗时，同步父组件的状态
  useEffect(() => {
    setLocalFormatType(formatType)
  }, [formatType, popoverOpen])

  return (
    <div className="flex items-center gap-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <span>格式配置</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <h4 className="font-medium">选择图片格式</h4>
              <FormatHelpIcon />
            </div>
            <RadioGroup
              value={localFormatType}
              onValueChange={(value: FormatType) => setLocalFormatType(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="original" id="original" />
                <Label htmlFor="original">原图</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="webp" id="webp" />
                <Label htmlFor="webp">WebP</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">Markdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">自定义</Label>
              </div>
            </RadioGroup>

            {localFormatType === 'custom' && (
              <div className="pt-2">
                <Label htmlFor="custom-suffix">自定义后缀</Label>
                <Input
                  id="custom-suffix"
                  value={customSuffix}
                  onChange={(e) => setCustomSuffix(e.target.value)}
                  placeholder="输入自定义后缀"
                  className="mt-1"
                />
              </div>
            )}

            <div className="bg-muted rounded-md p-2">
              <p className="text-sm font-medium">当前格式:</p>
              <code className="mt-1 block overflow-x-auto text-xs break-all whitespace-pre-wrap">
                {formatExample}
              </code>
            </div>

            <Button className="w-full" onClick={handleConfirm}>
              确认
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

const ImageGallery = memo(() => {
  // 获取图片并按照日期从晚到早排序
  const images = useLiveQuery<GalleryList[]>(
    () =>
      imagesTable.toArray().then((images) =>
        images
          .sort((a, b) => b.date - a.date)
          .map((item) => ({
            aspectRatio: calculateImageRatio(item),
            compressSrc: toWebp(item.url),
            key: item.id,
            name: item.name,
            src: item.url
          }))
      ),
    []
  )

  const { active, handleClose, handleOpen, setActive, visible } =
    useImagePreview()

  const [formatType, setFormatType] = useState<FormatType>('original')
  const [customSuffix, setCustomSuffix] = useState('')

  // 处理格式变更
  const handleFormatChange = useCallback((type: FormatType, suffix: string) => {
    setFormatType(type)
    setCustomSuffix(suffix)
  }, [])

  const handleCopy = useCallback(
    (name: string, url: string) => {
      let copyText = url
      if (formatType === 'markdown') {
        copyText = toMarkdown(url, name)
      } else if (formatType === 'webp') {
        copyText = toWebp(url)
      } else if (formatType === 'custom') {
        copyText = `${url}${customSuffix}`
      }

      copyToClipboard(copyText).then((success) => {
        if (success) {
          toast.success(
            <p>
              <span>复制成功: {name}</span>
              <br />
              <span className="break-all">{copyText}</span>
            </p>,
            {
              closeButton: true
            }
          )
        } else {
          toast.error('复制失败，请手动复制')
        }
      })
    },
    [formatType, customSuffix]
  )

  if (!images) return null

  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          {/* 标题 */}
          <h3 className="text-lg font-medium">已传图片</h3>
          {/* 格式配置 */}
          <FormatConfig
            formatType={formatType}
            onFormatChange={handleFormatChange}
          />
        </div>
        {/* 图片列表 */}
        {images && images.length > 0 ? (
          <GalleryList
            handleCopyImage={handleCopy}
            handleOpenPreview={handleOpen}
            images={images}
          />
        ) : (
          // 暂无图片
          <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-lg">
            <ImageOff
              className="text-muted-foreground/60 size-12"
              strokeWidth={1.5}
            />
            <p className="text-muted-foreground text-sm font-medium">
              暂无图片
            </p>
          </div>
        )}

        {/* 图片预览 */}
        {images && images.length > 0 && (
          <ImagePreview
            active={active}
            close={handleClose}
            images={images}
            setActive={setActive}
            visible={visible}
          />
        )}
      </CardContent>
    </Card>
  )
})

export default ImageGallery
