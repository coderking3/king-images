import { memo } from 'react'

import { Container } from '@/components'
import { useIsTop } from '@/hooks'
import { cn } from '@/utils'

import Logo from './Logo'
import UserCard from './UserCard'

interface HeaderProps {
  height: number
}

const Header = memo(({ height }: HeaderProps) => {
  const isTop = useIsTop()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b-[0.8px] backdrop-blur transition-all duration-200 select-none min-lg:px-0',
        isTop
          ? 'bg-transparent'
          : 'bg-background/95 supports-[backdrop-filter]:bg-background/60',
        isTop ? 'border-transparent' : 'border-gray-200 dark:border-gray-800'
      )}
    >
      <Container
        className="flex max-w-[1376px] items-center justify-between"
        wrapperClassName="px-4 min-[768px]:px-8"
        style={{ height: `${height}px` }}
      >
        <Logo />

        <div className="flex items-center gap-2">
          <UserCard></UserCard>
        </div>
      </Container>
    </header>
  )
})

/* 
background-image: radial-gradient(rgba(0, 0, 0, 0) 1px, var(--background) 1px);
*/

export default Header
