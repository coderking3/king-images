import type { ChangeEvent, ClipboardEvent, DragEvent } from 'react'

import type { UploadProgress } from '@/types'

import { motion } from 'framer-motion'
import { UploadIcon, X, ZoomIn } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Image, ImagePreview, useImagePreview } from '@/components'
import {
  Button,
  Card,
  CardContent,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'
import { imagesTable } from '@/db'
import { useIsMobile } from '@/hooks'
import { useUploadStore } from '@/store'
import { cn, copyToClipboard, toMarkdown, toWebp } from '@/utils'
import { uploadBatch } from '@/utils/upload'

type ImageFormat = 'markdown' | 'webp'
const FormatSelector = memo(
  ({
    format,
    setFormat
  }: {
    format: ImageFormat
    setFormat: (format: ImageFormat) => void
  }) => (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-medium">复制格式</h3>
      <RadioGroup
        defaultValue="markdown"
        className="flex space-x-4"
        value={format}
        onValueChange={(value: ImageFormat) => setFormat(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="markdown" id="markdown" />
          <Label htmlFor="markdown">Markdown</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="webp" id="webp" />
          <Label htmlFor="webp">WebP</Label>
        </div>
      </RadioGroup>
    </div>
  )
)

const UploadArea = memo(() => {
  const { setUploadFiles, uploadFiles } = useUploadStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 处理文件选择
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files).filter((file) =>
          file.type.startsWith('image/')
        )
        setUploadFiles([...uploadFiles, ...newFiles])
        // 清空input值，允许重复选择相同文件
        e.target.value = ''
      }
    },
    [uploadFiles]
  )

  // 处理文件拖拽
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.startsWith('image/')
        )
        setUploadFiles([...uploadFiles, ...newFiles])
      }
    },
    [uploadFiles]
  )

  // 处理粘贴事件
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      // 阻止事件冒泡，防止多次处理同一粘贴事件
      e.stopPropagation()

      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []

      // 直接处理所有图片文件，不再使用Set去重
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // 处理剪贴板中的图片文件
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        setUploadFiles([...uploadFiles, ...imageFiles])
      }
    },
    [uploadFiles]
  )

  // 触发文件选择器点击
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // 添加全局粘贴事件监听
  useEffect(() => {
    const pasteHandler = handlePaste as unknown as EventListener
    document.addEventListener('paste', pasteHandler)

    return () => {
      document.removeEventListener('paste', pasteHandler)
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div
        ref={uploadAreaRef}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0} // 使div可聚焦，便于捕获键盘事件
      >
        <div className="flex flex-col items-center">
          <UploadIcon className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            粘贴拖拽到此处，或点击选择文件
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            支持JPG、PNG、GIF、WebP等常见图片格式，无文件大小限制
          </p>
          <Button className="mt-4" onClick={triggerFileInput}>
            选择文件
          </Button>
        </div>
      </div>
    </div>
  )
})

interface PreviewImage {
  key: string
  name: string
  src: string
}

interface UploadFilePreviewListProps {
  handleOpenPreview: (index: number) => void
  handleRemoveImage: (index: number) => void
  images: PreviewImage[]
}

const UploadFilePreviewList = memo((props: UploadFilePreviewListProps) => {
  const { handleOpenPreview, handleRemoveImage, images } = props

  const isMobile = useIsMobile(448)

  return (
    <div className="max-h-[476px] overflow-y-auto will-change-scroll">
      <div className="grid grid-cols-2 gap-2 will-change-transform sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((item, index) => (
          <div
            key={item.key}
            className="group relative aspect-square overflow-hidden rounded-md"
          >
            <motion.img
              src={item.src}
              alt={item.name}
              className="size-full cursor-pointer rounded-md"
              style={{ objectFit: 'cover' }}
            />
            <motion.div
              className="supports-[backdrop-filter]:bg-foreground/30 absolute inset-0 justify-between backdrop-blur transition-opacity"
              initial={{ opacity: 0 }}
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
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* 删除 */}
              <Button
                className="!text-k-primary-foreground absolute top-2 right-2 size-6 rounded-full bg-red-500 hover:bg-red-600"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage(index)
                }}
              >
                <X className="size-4" />
              </Button>

              {/* 预览 */}
              <motion.div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <motion.button
                  className="text-k-primary-foreground bg-k-primary-foreground/30 rounded-full p-[8px] backdrop-blur"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleOpenPreview(index)}
                >
                  <ZoomIn className="size-[24px]" strokeWidth={2.5} />
                </motion.button>
              </motion.div>

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

const SelectedUploadFiles = memo(() => {
  const { setRecentlyImages, setUploadFiles, uploadFiles } = useUploadStore()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<null | UploadProgress>(
    null
  )

  const previewList = useMemo<PreviewImage[]>(() => {
    return uploadFiles.map((file) => ({
      key: `${file.name}-${file.lastModified}`,
      name: file.name,
      src: URL.createObjectURL(file)
    }))
  }, [uploadFiles])

  const { active, handleClose, handleOpen, setActive, visible } =
    useImagePreview()

  // 移除已选文件
  const removeFile = useCallback(
    (index: number) => {
      setUploadFiles(uploadFiles.filter((_, i) => i !== index))
    },
    [uploadFiles]
  )

  // 移除所有文件
  const removeAllFiles = () => {
    setUploadFiles([])
  }

  if (uploadFiles.length === 0) return null

  // 上传图片
  const handleImageUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('请先选择要上传的图片')
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadBatch(uploadFiles, 3, (progress) => {
        setUploadProgress(progress)
      })

      if (result.successCount > 0) {
        imagesTable.bulkAdd(result.success)
        setRecentlyImages(result.success)
        toast.success(`成功上传${result.successCount}张图片`)
      }

      if (result.failedCount > 0) {
        toast.error(`${result.failedCount}张图片上传失败`)
      }

      // 清空已上传的文件
      if (result.successCount === uploadFiles.length) {
        setUploadFiles([])
      } else {
        // 只保留上传失败的文件
        const failedFileNames = new Set(
          result.failed.map((item) => item.file.name)
        )
        setUploadFiles(
          uploadFiles.filter((file) => !failedFileNames.has(file.name))
        )
      }
    } catch (error) {
      toast.error('上传过程中发生错误')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="mt-6 flex flex-col">
      <h3 className="mb-3 text-lg font-medium">
        已选文件 ({uploadFiles.length})
      </h3>

      {/* 已选图片列表 */}
      <UploadFilePreviewList
        handleOpenPreview={handleOpen}
        handleRemoveImage={removeFile}
        images={previewList}
      />
      {/* 已选图片预览 */}
      <ImagePreview
        active={active}
        close={handleClose}
        images={previewList}
        setActive={setActive}
        visible={visible}
      />

      {/* 上传进度显示 */}
      {isUploading && uploadProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              正在上传: {uploadProgress.currentFileName} (
              {uploadProgress.current}/{uploadProgress.total})
            </span>
            <span>
              {uploadProgress.success}成功 / {uploadProgress.failed}失败
            </span>
          </div>
          <Progress value={uploadProgress.percent} />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              上传速度: {(uploadProgress.speed / 1024 / 1024).toFixed(2)} MB/s
            </span>
            <span>
              剩余时间: {Math.ceil(uploadProgress.remainingTime / 1000)}秒
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="destructive"
          disabled={isUploading}
          onClick={removeAllFiles}
        >
          清除所有
        </Button>
        <Button onClick={handleImageUpload} disabled={isUploading}>
          {isUploading ? '上传中...' : '上传全部'}
        </Button>
      </div>
    </div>
  )
})

const RecentlyUploadedList = memo(({ format }: { format: ImageFormat }) => {
  const { recentlyImages } = useUploadStore()

  // 如果最近上传的图片为空，则不显示
  if (recentlyImages.length === 0) return null

  const handleCopyImage = (name: string, url: string) => {
    const copyText =
      format === 'markdown' ? toMarkdown(url, name) : toWebp(url, name)

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
  }

  return (
    <div className="mt-6 pb-3">
      <h3 className="mb-3 text-lg font-medium">最近上传</h3>
      <div
        className="max-h-[320px] transform-gpu overflow-y-auto overscroll-contain scroll-smooth will-change-scroll"
        style={{
          contain: 'layout style paint',
          overscrollBehavior: 'contain',
          transform: 'translate3d(0, 0, 0)',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position'
        }}
      >
        <div
          className={cn(
            'grid max-h-[320px] w-full grid-cols-1 gap-3 will-change-transform',
            recentlyImages.length < 2 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'
          )}
          style={{
            contain: 'layout style paint',
            isolation: 'isolate'
          }}
        >
          {recentlyImages.map((item) => (
            <div
              key={item.id}
              className="flex size-full transform-gpu items-center justify-between overflow-hidden rounded-md border p-2"
              style={{
                contain: 'layout style paint',
                isolation: 'isolate',
                transform: 'translateZ(0)'
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Image
                  src={toWebp(item.url, '80w_80h_')}
                  alt={item.name}
                  className="aspect-square size-20 flex-shrink-0 rounded-md"
                  imageStyle={{
                    backfaceVisibility: 'hidden',
                    imageRendering: 'auto',
                    transform: 'translateZ(0)'
                  }}
                />
                <div className="flex-1 truncate overflow-hidden">
                  {item.name}
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => handleCopyImage(item.name, item.url)}
                >
                  复制
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

const ImageUpload = memo(() => {
  const [format, setFormat] = useState<ImageFormat>('markdown')

  const handleFormatChange = useCallback((value: ImageFormat) => {
    setFormat(value)
  }, [])

  return (
    <Card>
      <CardContent>
        <FormatSelector format={format} setFormat={handleFormatChange} />

        {/* 上传区域 */}
        <UploadArea />

        {/* 已选文件预览 */}
        <SelectedUploadFiles />

        {/* 最近上传 */}
        <RecentlyUploadedList format={format} />
      </CardContent>
    </Card>
  )
})

export default ImageUpload
