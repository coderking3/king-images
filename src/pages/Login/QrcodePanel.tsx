import { CheckIcon, Loader2, RotateCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { generateQrcode, pollQrcode } from '@/api'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui'
import { useUserStore } from '@/store'

interface OverlayProps {
  isLoading?: boolean
  isScanned?: boolean
  onClick?: () => void
}

export function Overlay({
  isLoading = false,
  isScanned = false,
  onClick
}: OverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-[6px] dark:bg-gray-900/90">
      {isLoading ? (
        <Loader2 className="size-9 animate-spin text-gray-500" />
      ) : isScanned ? (
        <div className="size-9 rounded-full bg-white p-1 shadow-xl dark:bg-gray-900">
          <CheckIcon
            strokeWidth={3}
            className="size-full text-[#07c160] dark:text-green-400"
          />
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="border-0 text-gray-500 shadow-none transition-all hover:bg-white hover:text-[#155dfc] hover:shadow-lg dark:hover:bg-gray-900"
          onClick={onClick}
        >
          <RotateCw className="size-6" />
        </Button>
      )}
    </div>
  )
}

interface QrcodePanelProps {
  toggleButton: React.ReactNode
}

function QrcodePanel({ toggleButton }: QrcodePanelProps) {
  const navigate = useNavigate()
  const { fetchSpaceInfo, setCertificate } = useUserStore()

  // 二维码登录相关状态
  const [qrcodeUrl, setQrcodeUrl] = useState<string>('')
  const [qrcodeKey, setQrcodeKey] = useState<string>('')
  const [qrcodeStatus, setQrcodeStatus] = useState<string>('等待扫码')
  const [polling, setPolling] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(false)
  // 记录二维码生成时间，用于自动刷新
  const qrcodeTimestampRef = useRef<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 获取二维码
  const fetchQrcode = async () => {
    try {
      setIsLoading(true)
      setQrcodeUrl('')
      setQrcodeStatus('获取二维码中...')

      const response = await generateQrcode()
      if (response.data && response.code === 0) {
        setQrcodeUrl(response.data.url)
        setQrcodeKey(response.data.qrcode_key)
        setPolling(true)
        setQrcodeStatus('等待扫码')
        // 记录生成时间
        qrcodeTimestampRef.current = Date.now()
      } else {
        setQrcodeStatus(`获取二维码失败，请刷新重试`)
        toast.error('获取二维码失败，请刷新重试')
      }
    } catch (error) {
      console.error('获取二维码失败:', error)
      setQrcodeStatus('获取二维码失败，请刷新重试')
      toast.error('获取二维码失败，请刷新重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 从URL中解析登录凭证
  const extractCredentialsFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const params = new URLSearchParams(urlObj.search)
      console.log(`🚀 params:`, params)

      // 返回关键凭证用于状态管理
      const sessdata = params.get('SESSDATA')
      const bili_jct = params.get('bili_jct')

      return { bili_jct, sessdata }
    } catch (error) {
      console.error('解析URL失败:', error)
      return { bili_jct: null, sessdata: null }
    }
  }

  // 轮询检查二维码状态
  const checkQrcodeStatus = async () => {
    if (!qrcodeKey || !polling) return

    // 检查二维码是否超过180秒（3分钟）
    const now = Date.now()
    if (now - qrcodeTimestampRef.current > 180000) {
      setQrcodeStatus('二维码已过期，请刷新')
      setPolling(false)
      return
    }

    try {
      const response = await pollQrcode(qrcodeKey)

      // 根据B站API返回的状态码处理不同状态
      if (response.data && response.code === 0) {
        const data = response.data

        switch (data.code) {
          case 0: // 成功
            setQrcodeStatus('扫码登录成功')
            setPolling(false)
            setIsLogin(true)

            // 从URL中解析登录凭证
            if (data.url) {
              console.log('扫码登录成功，返回的URL:', data.url)
              const { bili_jct, sessdata } = extractCredentialsFromUrl(data.url)

              if (sessdata && bili_jct) {
                setCertificate({
                  bili_jct,
                  SESSDATA: sessdata
                })

                // 获取用户信息并跳转
                try {
                  const isFetchInfo = await fetchSpaceInfo()
                  if (isFetchInfo) {
                    navigate('/')
                  } else {
                    setQrcodeStatus('获取用户信息失败，请重试')
                    setIsLogin(false)
                  }
                } catch (error) {
                  console.error('获取用户信息失败:', error)
                  setQrcodeStatus('登录成功但获取用户信息失败')
                }
              } else {
                setQrcodeStatus('未能从URL中获取登录凭证')
                setIsLogin(false)
              }
            } else {
              setQrcodeStatus('登录成功但未返回URL信息')
              setIsLogin(false)
            }
            break

          case 86038: // 二维码已失效
            setQrcodeStatus('二维码已失效，请刷新二维码')
            setPolling(false)
            break

          case 86090: // 二维码已扫码未确认
            setQrcodeStatus('已扫描，请在手机上确认登录')
            break

          case 86101: // 未扫码
            setQrcodeStatus('等待扫码')
            break

          default:
            setQrcodeStatus(`未知状态: ${data.message || data.code}`)
        }
      } else {
        setQrcodeStatus(`检查状态失败: ${response?.message || '未知错误'}`)
      }
    } catch (error) {
      console.error('检查二维码状态失败:', error)
      setQrcodeStatus('检查状态失败，请刷新二维码')
      setPolling(false)
    }
  }

  // 首次加载时获取二维码
  useEffect(() => {
    fetchQrcode()
  }, [])

  // 轮询检查二维码状态
  useEffect(() => {
    if (!polling || !qrcodeKey) return

    const intervalId = setInterval(checkQrcodeStatus, 2000) // 每2秒检查一次

    return () => {
      clearInterval(intervalId)
    }
  }, [polling, qrcodeKey])

  const isScanned = useMemo(() => {
    return qrcodeStatus === '已扫描，请在手机上确认登录' || isLogin
  }, [qrcodeStatus, isLogin])

  return (
    <Card className="relative shadow-lg">
      {/* 左上角的切换按钮 */}
      {toggleButton}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>扫描二维码登录您的B站账号</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 二维码登录组件 */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative size-[200px]">
              {/* 显示二维码或蒙版 */}
              {qrcodeUrl && !isLoading ? (
                <QRCodeSVG
                  value={qrcodeUrl}
                  size={'100%' as unknown as number}
                  level="H" // 高容错率
                />
              ) : null}

              {/* 加载状态、过期、未扫码、或出错时显示蒙版 */}
              {(isLoading ||
                !qrcodeUrl ||
                (!polling && !isLogin) ||
                isScanned) && (
                <Overlay
                  isLoading={isLoading}
                  onClick={fetchQrcode}
                  isScanned={isScanned}
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">{qrcodeStatus}</p>
              <p className="mt-1 text-xs text-gray-400">二维码有效期3分钟</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="w-full">
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="text-muted-foreground bg-white px-2 dark:bg-gray-800">
                使用说明
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-500">
              1. 打开B站APP扫描上方二维码
              <br />
              2. 在手机上确认登录
              <br />
              3. 登录成功后将自动跳转
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default QrcodePanel
