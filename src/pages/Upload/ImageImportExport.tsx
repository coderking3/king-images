import type { ImageInfo } from '@/types'

import { Download, Upload } from 'lucide-react'
import { memo, useCallback } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui'
import { imagesTable } from '@/db'
import { useIsMobile } from '@/hooks'
import { cn } from '@/utils'

// 定义BulkError接口
interface BulkError extends Error {
  failures: Array<{
    error: Error
    key: string
  }>
  name: string
}

function formatDate(date: Date) {
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  return formattedDate
}

interface ImageImportExportProps {
  className?: string
}

const ImageImportExport = memo(({ className }: ImageImportExportProps) => {
  const isMobile = useIsMobile(448)

  // 导出图片数据
  const handleExport = useCallback(async () => {
    try {
      // 获取所有图片数据
      const images = await imagesTable.toArray()

      if (images.length === 0) {
        toast.error('没有可导出的图片数据')
        return
      }

      // 创建导出数据
      const exportData = JSON.stringify(images, null, 2)

      // 创建下载链接
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      // 设置下载文件名（使用当前日期时间）
      const now = new Date()
      const fileName = `king3图床数据-${formatDate(now)}.json`

      // 触发下载
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // 清理
      URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast.success(`成功导出 ${images.length} 张图片数据`)
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败，请查看控制台获取详细信息')
    }
  }, [])

  // 导入图片数据
  const handleImport = useCallback(() => {
    // 创建文件输入框
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    // 监听文件选择
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]

      if (!file) {
        return
      }

      try {
        // 读取文件内容
        const reader = new FileReader()

        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string
            const importedData = JSON.parse(content) as ImageInfo[]

            if (!Array.isArray(importedData)) {
              toast.error('导入的数据格式不正确')
              return
            }

            // 验证数据结构
            const isValid = importedData.every(
              (item) =>
                typeof item === 'object' &&
                item !== null &&
                'id' in item &&
                'name' in item &&
                'url' in item &&
                'width' in item &&
                'height' in item &&
                'date' in item
            )

            if (!isValid) {
              toast.error('导入的数据格式不正确')
              return
            }

            try {
              // 导入数据到数据库
              // 使用bulkPut替代bulkAdd，这样如果有相同ID的记录会覆盖而不是报错
              await imagesTable.bulkPut(importedData)
              toast.success(`成功导入 ${importedData.length} 张图片数据`)
            } catch (error: unknown) {
              if (error instanceof Error && error.name === 'BulkError') {
                // 如果有部分记录失败，但其他记录成功了
                const bulkError = error as BulkError
                console.error('部分数据导入失败:', bulkError)
                toast.warning(
                  `部分数据导入失败，成功导入 ${importedData.length - bulkError.failures.length} 张图片`
                )
              } else {
                // 其他错误
                throw error
              }
            }
          } catch (error) {
            console.error('解析导入数据失败:', error)
            toast.error('解析导入数据失败，请确保文件格式正确')
          }
        }

        reader.readAsText(file)
      } catch (error) {
        console.error('导入失败:', error)
        toast.error('导入失败，请查看控制台获取详细信息')
      }
    }

    // 触发文件选择
    fileInput.click()
  }, [])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        variant="outline"
        onClick={handleExport}
        className="flex items-center gap-2"
      >
        <Upload className="size-4" />
        {!isMobile && <span>导出数据</span>}
      </Button>

      <Button
        variant="outline"
        onClick={handleImport}
        className="flex items-center gap-2"
      >
        <Download className="size-4" />
        {!isMobile && <span>导入数据</span>}
      </Button>
    </div>
  )
})

export default ImageImportExport
