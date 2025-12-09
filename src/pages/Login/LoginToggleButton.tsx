import { Monitor, QrCode } from 'lucide-react'

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'

interface LoginToggleButtonProps {
  methodType: 'certificate' | 'qrcode'
  toggleLoginMethod: (method: 'certificate' | 'qrcode') => void
}

function LoginToggleButton({
  methodType,
  toggleLoginMethod
}: LoginToggleButtonProps) {
  const handleClick = () => {
    toggleLoginMethod(methodType)
  }
  return (
    <div className="absolute top-2 left-2 z-20">
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleClick}
          >
            {methodType === 'qrcode' ? (
              <QrCode className="size-5 text-gray-500" />
            ) : (
              <Monitor className="size-5 text-gray-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{methodType === 'qrcode' ? '二维码登录' : '凭证登录'}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default LoginToggleButton
