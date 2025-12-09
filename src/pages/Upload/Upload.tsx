import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Transition } from '@/components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

import ImageGallery from './ImageGallery'
import ImageImportExport from './ImageImportExport'
import ImageUpload from './ImageUpload'

type UploadTab = 'gallery' | 'upload'

function Upload() {
  const [searchParams, setSearchParams] = useSearchParams()

  const uploadTab = useMemo(() => {
    return (searchParams.get('tab') as UploadTab) || 'upload'
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<UploadTab>(uploadTab)

  useEffect(() => {
    if (uploadTab !== activeTab) {
      setActiveTab(uploadTab)
    }
  }, [uploadTab])

  function handleTabChange(value: string) {
    setSearchParams({ tab: value })
    setActiveTab(value as UploadTab)
  }

  return (
    <Transition>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative mb-6"
        >
          {/* tab切换 */}
          <TabsList>
            <TabsTrigger value="upload">图片上传</TabsTrigger>
            <TabsTrigger value="gallery">图片库</TabsTrigger>
          </TabsList>

          {/* 图片导入导出 */}
          <ImageImportExport className="absolute top-0 right-0" />

          {/* 文件上传 */}
          <TabsContent value="upload">
            <Transition>
              <ImageUpload />
            </Transition>
          </TabsContent>

          {/* 图片库 */}
          <TabsContent value="gallery">
            <Transition>
              <ImageGallery />
            </Transition>
          </TabsContent>
        </Tabs>
      </div>
    </Transition>
  )
}

export default Upload
