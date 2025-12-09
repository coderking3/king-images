import type { BatchUploadResult, ImageInfo, UploadProgress } from '@/types'

import { UUID } from 'uuidjs'

import { uploadImage } from '@/api'

import { getImgSize } from './processor'

export interface UploadResponse {
  /** 结果数据 */
  data: ImageInfo | null
  /** 结果消息 */
  message: string
  /** 结果是否成功 */
  success: boolean
}

/**
 * 上传图片
 * @param file 图片文件
 */
export const upload = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await uploadImage(formData)
    if (response.code === 0 && response.data) {
      const { location } = response.data

      const url = location.replace('http:', 'https:')
      const { height, width } = await getImgSize(file)
      const type = file.type.split('/')[1]
      const name = file.name.split(`.${type}`)[0]

      return {
        data: {
          date: new Date().getTime(),
          height,
          id: UUID.generate(),
          name,
          type,
          url,
          width
        },
        message: `${name}图片，上传成功`,
        success: true
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error: unknown) {
    return {
      data: null,
      message: error instanceof Error ? error.message : '上传失败，请稍后重试',
      success: false
    }
  }
}

/**
 * 批量上传图片
 * @param files 文件列表
 * @param concurrency 并发数，默认3
 * @param onProgress 进度回调
 */
export const uploadBatch = async (
  files: File[],
  concurrency = 3,
  onProgress?: (progress: UploadProgress) => void
): Promise<BatchUploadResult> => {
  const result: BatchUploadResult = {
    failed: [],
    failedCount: 0,
    success: [],
    successCount: 0,
    total: files.length
  }

  // 进度统计
  const startTime = Date.now()
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  let uploadedBytes = 0

  // 为每个文件创建虚拟进度存储
  const fileProgress = new Map<File, number>()
  files.forEach((file) => fileProgress.set(file, 0))

  // 虚拟进度定时器存储
  const progressIntervals = new Map<File, NodeJS.Timeout>()

  const updateProgress = (currentFile: File, filePercent = 100) => {
    if (!onProgress) return

    // 更新当前文件的进度
    fileProgress.set(currentFile, filePercent)

    // 计算总体进度
    const totalProgress = files.reduce((sum, file) => {
      return sum + (fileProgress.get(file) || 0) * (file.size / totalBytes)
    }, 0)

    const current = result.successCount + result.failedCount
    const elapsedTime = Date.now() - startTime
    const speed = uploadedBytes / (elapsedTime / 1000) // bytes per second
    const remainingBytes = totalBytes - uploadedBytes
    const remainingTime = speed > 0 ? (remainingBytes / speed) * 1000 : 0

    onProgress({
      current,
      currentFileName: currentFile.name,
      failed: result.failedCount,
      percent: totalProgress,
      remainingTime,
      speed,
      success: result.successCount,
      total: files.length
    })
  }

  // 为单个文件创建虚拟进度
  const startVirtualProgress = (file: File): void => {
    // 清除可能存在的旧定时器
    if (progressIntervals.has(file)) {
      clearInterval(progressIntervals.get(file)!)
    }

    let progress = 0
    const interval = setInterval(() => {
      // 虚拟进度最多到95%，留5%给实际完成时
      if (progress < 95) {
        // 随着进度增加，增长速度变慢
        const increment = (100 - progress) / 20
        progress += Math.min(increment, 10)
        updateProgress(file, progress)
      } else {
        clearInterval(interval)
      }
    }, 300)

    progressIntervals.set(file, interval)
  }

  // 清除文件的虚拟进度
  const stopVirtualProgress = (file: File): void => {
    if (progressIntervals.has(file)) {
      clearInterval(progressIntervals.get(file)!)
      progressIntervals.delete(file)
    }
  }

  // 创建上传队列
  const queue = [...files]
  const executing: Promise<void>[] = []

  const enqueue = async (): Promise<void> => {
    if (queue.length === 0) return

    const file = queue.shift()!

    // 启动虚拟进度
    startVirtualProgress(file)
    updateProgress(file, 0)

    try {
      const uploadResult = await upload(file)
      // 停止虚拟进度并设置为100%
      stopVirtualProgress(file)

      if (uploadResult.success && uploadResult.data) {
        result.success.push(uploadResult.data)
        result.successCount++
        uploadedBytes += file.size
      } else {
        throw new Error(uploadResult.message)
      }
    } catch (error) {
      // 停止虚拟进度并设置为100%
      stopVirtualProgress(file)

      result.failed.push({
        errorMessage:
          error instanceof Error ? error.message : '上传失败，请稍后重试',
        file
      })
      result.failedCount++
      uploadedBytes += file.size
    }

    // 无论成功失败，最终都将进度设为100%
    updateProgress(file, 100)

    // 继续处理队列中的下一个文件
    if (queue.length > 0) {
      return enqueue()
    }
  }

  // 启动初始的并发上传
  while (executing.length < concurrency && queue.length > 0) {
    const p = enqueue()
    executing.push(p)
    // 文件上传完成后从执行队列中移除
    p.then(() => {
      executing.splice(executing.indexOf(p), 1)
    })
  }

  // 等待所有上传完成
  await Promise.all(executing)

  // 清理所有可能剩余的进度定时器
  progressIntervals.forEach((interval) => clearInterval(interval))

  return result
}
