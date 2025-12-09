import type { ImageInfo } from '@/types'

import { create } from 'zustand'

interface UploadStore {
  /** 上传的图片文件 */
  uploadFiles: File[]
  /** 设置上传的图片文件 */
  setUploadFiles: (files: File[]) => void
  /** 最近上传图片 */
  recentlyImages: ImageInfo[]
  /** 设置最近上传图片 */
  setRecentlyImages: (images: ImageInfo[]) => void
}

const useUploadStore = create<UploadStore>((set) => ({
  uploadFiles: [],
  setUploadFiles: (files) => set({ uploadFiles: files }),
  recentlyImages: [],
  setRecentlyImages: (images) => set({ recentlyImages: images })
}))

export { useUploadStore }
