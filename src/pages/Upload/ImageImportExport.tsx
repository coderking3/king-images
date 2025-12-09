import type { ImageInfo } from '@/types'

import {
  Check,
  ClipboardCopy,
  Copy,
  Download,
  FileJson,
  FileUp,
  Upload
} from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui' // 确保引入了 Tabs, Textarea, Label
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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 验证图片数据的辅助函数
const validateImageData = (data: any[]): data is ImageInfo[] => {
  if (!Array.isArray(data)) return false
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'url' in item
  )
}

// 核心数据库保存逻辑
const saveToDb = async (importedData: ImageInfo[]) => {
  try {
    // 使用bulkPut替代bulkAdd，覆盖相同ID
    await imagesTable.bulkPut(importedData)
    toast.success(`成功导入 ${importedData.length} 张图片数据`)
    return true
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'BulkError') {
      const bulkError = error as BulkError
      console.error('部分数据导入失败:', bulkError)
      toast.warning(
        `部分数据导入失败，成功导入 ${importedData.length - bulkError.failures.length} 张图片`
      )
      return true // 算作部分成功
    } else {
      console.error('数据库写入失败:', error)
      toast.error('数据库写入失败')
      return false
    }
  }
}

const ImportModal = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 处理文件导入
  const handleFileImport = useCallback(() => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      setIsLoading(true)
      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string
            const parsedData = JSON.parse(content)

            if (!validateImageData(parsedData)) {
              toast.error('导入的数据格式不正确，缺少必要字段')
              return
            }

            const success = await saveToDb(parsedData)
            if (success) setIsOpen(false)
          } catch {
            toast.error('JSON 解析失败，请检查文件内容')
          } finally {
            setIsLoading(false)
          }
        }
        reader.readAsText(file)
      } catch {
        toast.error('读取文件失败')
        setIsLoading(false)
      }
    }
    fileInput.click()
  }, [])

  // 处理文本粘贴导入
  const handleTextImport = async () => {
    if (!jsonText.trim()) {
      toast.error('请输入 JSON 数据')
      return
    }

    setIsLoading(true)
    try {
      const parsedData = JSON.parse(jsonText)

      if (!validateImageData(parsedData)) {
        toast.error('导入的数据格式不正确，缺少必要字段')
        return
      }

      const success = await saveToDb(parsedData)
      if (success) {
        setJsonText('')
        setIsOpen(false)
      }
    } catch {
      toast.error('JSON 格式错误，请检查输入')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导入数据</DialogTitle>
          <DialogDescription>
            你可以选择上传 JSON 文件，或者直接粘贴 JSON 数据。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">文件导入</TabsTrigger>
            <TabsTrigger value="text">粘贴文本</TabsTrigger>
          </TabsList>

          {/* 文件导入面板 */}
          <TabsContent value="file" className="space-y-4 py-4">
            <div
              className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors"
              onClick={handleFileImport}
            >
              <div className="bg-muted rounded-full p-3">
                <FileUp className="text-muted-foreground size-6" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">点击选择文件</p>
                <p className="text-muted-foreground text-xs">支持 .json 格式</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleFileImport}
              disabled={isLoading}
            >
              {isLoading ? '导入中...' : '选择文件'}
            </Button>
          </TabsContent>

          {/* 文本导入面板 */}
          <TabsContent value="text" className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="json-import">JSON 数据</Label>
              <Textarea
                id="json-import"
                placeholder='[{"id": "...", "url": "..."}]'
                className="h-[200px] font-mono text-xs"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleTextImport}
              disabled={isLoading}
            >
              {isLoading ? '解析并导入' : '导入数据'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

const ExportModal = ({ children }: { children: React.ReactNode }) => {
  const [dataStr, setDataStr] = useState('')
  const [count, setCount] = useState(0)
  const [hasCopied, setHasCopied] = useState(false)

  // 打开弹窗时获取数据
  const loadData = async () => {
    try {
      const images = await imagesTable.toArray()
      setCount(images.length)
      setDataStr(JSON.stringify(images, null, 2))
    } catch {
      toast.error('获取数据失败')
    }
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dataStr)
      setHasCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  // 下载文件
  const handleDownload = () => {
    if (!dataStr) return
    try {
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const fileName = `king3图床数据-${formatDate(new Date())}.json`

      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      URL.revokeObjectURL(url)
      document.body.removeChild(link)
      toast.success('下载已开始')
    } catch {
      toast.error('创建下载链接失败')
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && loadData()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导出数据</DialogTitle>
          <DialogDescription>
            共发现 {count} 条图片数据。你可以下载为文件或复制 JSON。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">导出文件</TabsTrigger>
            <TabsTrigger value="text">复制 JSON</TabsTrigger>
          </TabsList>

          {/* 导出文件面板 */}
          <TabsContent value="file" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <div className="bg-primary/10 rounded-full p-4">
                <FileJson className="text-primary size-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">数据准备就绪</h4>
                <p className="text-muted-foreground text-sm">
                  即将导出 {count} 条图片数据
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleDownload}
              disabled={!dataStr}
            >
              <Download className="mr-2 size-4" /> 下载 .json 文件
            </Button>
          </TabsContent>

          {/* 复制文本面板 */}
          <TabsContent value="text" className="space-y-4 py-4">
            <div className="relative">
              <Textarea
                readOnly
                value={dataStr}
                className="h-[200px] resize-none pr-10 font-mono text-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleCopy}
              >
                {hasCopied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleCopy}
              disabled={!dataStr}
            >
              <ClipboardCopy className="mr-2 size-4" />
              {hasCopied ? '已复制' : '复制到剪贴板'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface ImageImportExportProps {
  className?: string
}

const ImageImportExport = memo(({ className }: ImageImportExportProps) => {
  const isMobile = useIsMobile(448)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <ExportModal>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="size-4" />
          {!isMobile && <span>导出数据</span>}
        </Button>
      </ExportModal>

      <ImportModal>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="size-4" />
          {!isMobile && <span>导入数据</span>}
        </Button>
      </ImportModal>
    </div>
  )
})

export default ImageImportExport
