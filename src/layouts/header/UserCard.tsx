import { Home, Images, LogIn, Upload } from 'lucide-react'
import { memo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui'
import { useHoverOpen } from '@/hooks'
import { Bilibili, Github } from '@/icons'
import { useUserStore } from '@/store'

// 定义UserInfo类型
interface UserInfo {
  avatar: string
  mid: number
  name: string
  sign: string
}

// 登录按钮组件
function LoginButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLoginPage = location.pathname === '/login'

  const handleNavigation = () => {
    if (isLoginPage) {
      navigate('/')
    } else {
      navigate('/login')
    }
  }

  return (
    <Button variant="ghost" onClick={handleNavigation}>
      <div className="flex items-center gap-2">
        {isLoginPage ? (
          <>
            <Home className="h-4 w-4" />
            <span>首页</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>登录</span>
          </>
        )}
      </div>
    </Button>
  )
}

// 用户下拉菜单组件
interface CardProps {
  userInfo: null | UserInfo
}

const Card = memo(({ userInfo }: CardProps) => {
  const { hoverProps, open } = useHoverOpen({
    closeDelay: 50,
    openDelay: 100
  })
  const navigate = useNavigate()

  const goToBilibili = () => {
    window.open('https://www.bilibili.com', '_blank')
  }

  const goToGithub = () => {
    window.open('https://github.com/Coder-King3/king-images', '_blank')
  }

  const goToUpload = (tab: 'gallery' | 'upload') => {
    // 始终使用navigate进行导航，保持SPA体验
    navigate(`/upload?tab=${tab}`)
  }

  return (
    <HoverCard open={open}>
      <HoverCardTrigger asChild>
        <div
          className="flex h-full cursor-pointer items-center gap-1.5"
          {...hoverProps}
        >
          <span className="text-sm font-bold">{userInfo?.name}</span>
          <Avatar>
            <AvatarImage src={userInfo?.avatar} />
            <AvatarFallback>{userInfo?.name}</AvatarFallback>
          </Avatar>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64" {...hoverProps}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <Avatar className="mr-3 ml-2 size-14">
              <AvatarImage src={userInfo?.avatar} />
              <AvatarFallback>{userInfo?.name}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1">
              <h4 className="text-sm font-semibold">{userInfo?.name}</h4>
              <p className="text-muted-foreground inline-block h-[16px] max-w-[150px] overflow-hidden text-xs text-nowrap text-ellipsis transition-all hover:overflow-visible hover:whitespace-normal">
                {userInfo?.sign}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex flex-col space-y-1">
              <Button
                onClick={() => goToUpload('upload')}
                variant="ghost"
                className="justify-start px-2 text-sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                上传图片
              </Button>
              <Button
                onClick={() => goToUpload('gallery')}
                variant="ghost"
                className="justify-start px-2 text-sm"
              >
                <Images className="mr-2 h-4 w-4" />
                图片库
              </Button>
              <Button
                onClick={goToBilibili}
                variant="ghost"
                className="justify-start px-2 text-sm"
              >
                <Bilibili className="mr-2 h-4 w-4" />
                B站主页
              </Button>
              <Button
                onClick={goToGithub}
                variant="ghost"
                className="justify-start px-2 text-sm"
              >
                <Github className="mr-2 h-4 w-4" />
                Github
              </Button>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
})

// 主组件
const UserCard = memo(() => {
  const { loggedIn, userInfo } = useUserStore()

  return <>{loggedIn ? <Card userInfo={userInfo} /> : <LoginButton />}</>
})

export default UserCard
