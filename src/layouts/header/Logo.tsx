import { memo } from 'react'
import { useNavigate } from 'react-router'

import { APP_NAME } from '@/constants'
import { Logo as LogoIcon } from '@/icons'

interface LogoProps {
  fillColor?: string
  size?: number
}

const Logo = memo(
  ({ fillColor = 'var(--color-primary)', size = 28 }: LogoProps) => {
    const navigate = useNavigate()

    const goToWelcome = () => {
      navigate('/')
    }

    return (
      <div className="flex items-center gap-1.5" onClick={goToWelcome}>
        <LogoIcon fillColor={fillColor} size={size}></LogoIcon>
        <h1 className="text-xl font-bold">
          {APP_NAME.split(' ').join('-').toLowerCase()}
        </h1>
      </div>
    )
  }
)

export default Logo
