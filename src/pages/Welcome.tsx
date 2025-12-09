import { css, keyframes } from '@emotion/css'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router'

import { Container, Transition } from '@/components'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/constants'
import { Logo as LogoIcon } from '@/icons'
import { cn } from '@/utils'

const introContainerCss = css`
  @media (min-width: 960px) {
    flex-direction: row;
    text-align: left;
  }
`

const introMainCss = css`
  width: 100%;

  @media (min-width: 960px) {
    width: calc((100% / 3) * 2);
    order: 1;
    width: 100%;
    max-width: 592px;
    align-items: start;
  }

  .heading {
    letter-spacing: -0.4px;
    font-size: 32px;
    line-height: 42px;

    @media (min-width: 640px) {
      line-height: 56px;
      font-size: 48px;
    }

    @media (min-width: 960px) {
      font-size: 56px;
      line-height: 64px;
    }

    .title {
      height: 46px;
      background: linear-gradient(to right, #2f88ff, #6078ea);
      background-clip: text;
      color: transparent;

      @media (min-width: 640px) {
        height: 64px;
      }

      @media (min-width: 960px) {
        height: 70px;
      }
    }
  }

  .tagline {
    color: #67676c;
    /* line-height: 32px; */
    font-size: 18px;
    margin-top: 8px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;

    @media (min-width: 640px) {
      margin-top: 12px;
      line-height: 32px;
      font-size: 20px;
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }
    @media (min-width: 960px) {
      line-height: 36px;
      font-size: 24px;
    }
  }

  .actions {
    display: flex;
    margin-top: 18px;

    @media (min-width: 640px) {
      margin-top: 32px;
    }

    @media (max-width: 960px) {
      justify-content: center;
    }

    .action {
      height: 40px;
      width: 120px;
      font-size: 14px;

      @media (min-width: 960px) {
        height: 45px;
        width: 160px;
        font-size: 16px;
      }
    }
  }
`

const introImageCss = css`
  order: 1;
  margin: -90px -24px -70px;

  @media (max-width: 640px) {
    margin: -108px -24px -48px;
  }

  @media (min-width: 960px) {
    flex-grow: 1;
    order: 2;
    margin: 0;
    min-height: 100%;
  }

  .image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    width: 320px;
    height: 320px;

    @media (min-width: 640px) {
      width: 392px;
      height: 392px;
    }

    @media (min-width: 960px) {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      transform: translate(-32px, -32px);
    }
  }

  .image-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    width: 192px;
    height: 192px;
    background-image: radial-gradient(
      circle at center,
      #17ead9 0%,
      #2ee6d6 25%,
      #4592e6 50%,
      #5674ea 75%,
      #6078ea 100%
    );
    filter: blur(72px);
    transform: translate(-50%, -50%);

    @media (min-width: 640px) {
      width: 256px;
      height: 256px;
    }

    @media (min-width: 960px) {
      width: 320px;
      height: 320px;
    }
  }
`

// 创建平滑的浮动动画
const createFloatAnimation = (offsetX: number, offsetY: number) =>
  keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  25% {
    transform: translate(${offsetX * 0.3}px, ${offsetY * 0.3}px) scale(1.1);
    opacity: 0.7;
  }
  50% {
    transform: translate(${offsetX}px, ${offsetY}px) scale(1.2);
    opacity: 0.9;
  }
  75% {
    transform: translate(${offsetX * 0.3}px, ${offsetY * 0.3}px) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
`

/* 
  cx、css 和 cn 详解
  
  1. Emotion Css
  1.1 Emotion (css) 【css 函数返回样式生成的类名】
  className={css({
    color: textColor,
    fontSize: `${size}px`,
    transition: 'all 0.3s',
    '&:hover': {
      color: hoverColor
    },
    [breakpoint]: {
      fontSize: `${smallSize}px`
    }
  })}
  
  1.2 Emotion cx
    cx可以检测 Emotion 生成的类名，确保样式按正确的顺序覆盖。
    Emotion 生成的样式从左到右应用。后续样式会覆盖先前样式的属性值。
  className={cx(
    css({
      fontSize: '20px',
      background: 'green'
    }),
    css({
      fontSize: '20px',
      background: 'blue'
    })
  )}
  
  
  2. Tailwind 和 Emotion 混合使用
  2.1 单个Emotion css 的情况
  className={cn("tailwind类名", css({ animation: `${animation} 2s` }))}
  
  2.2 多个Emotion css 的情况
  className={cn(
    "tailwind类名",
    cx(
      css({ animation: `${animation} 2s` }),
      css({ animation: `${animation} 2s` })
    )
  )}
*/

interface ImagesLogoProps {
  logoColor?: {
    fillColor: string
    strokeColor: string
  }
  particleColor: [string, string]
  particleCount?: number
  size?: number
}

// ImagesLogo 组件
function ImagesLogo({
  logoColor = {
    fillColor: '#3B82F6',
    strokeColor: '#1E40AF'
  },
  particleColor = ['#3B82F6', '#1E40AF'],
  particleCount = 12,
  size = 120
}: ImagesLogoProps) {
  // 根据图标大小自动计算容器内边距
  // 小图标用相对较大的padding，大图标用相对较小的padding
  const containerPadding = Math.max(30, size * 0.4)

  // 计算容器大小，确保有足够空间显示粒子
  const containerSize = size + containerPadding * 2

  // 计算粒子分布的半径范围
  const minRadius = size * 0.6 // 距离logo中心的最小距离
  const maxRadius = size * 0.9 // 距离logo中心的最大距离

  // 生成粒子位置数据
  const particles = Array.from({ length: particleCount }, (_, i) => {
    // 使用角度分布确保粒子围绕logo均匀分布
    const angle = (i / particleCount) * 2 * Math.PI + Math.random() * 0.5
    const radius = minRadius + Math.random() * (maxRadius - minRadius)

    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    // 为每个粒子生成独特的动画偏移量
    const animationOffsetX = (Math.random() - 0.5) * 15
    const animationOffsetY = (Math.random() - 0.5) * 15

    return {
      animationOffsetX,
      animationOffsetY,
      delay: (i / particleCount) * 2, // 更均匀的延迟分布
      duration: 3 + Math.random() * 2, // 动画持续时间3-5秒
      id: i,
      size: 2 + Math.random() * 2, // 粒子大小变化
      x: 50 + (x / containerSize) * 100, // 转换为百分比
      y: 50 + (y / containerSize) * 100 // 转换为百分比
    }
  })

  return (
    <div
      className={'relative flex items-center justify-center'}
      style={{
        height: `${containerSize}px`,
        width: `${containerSize}px`
      }}
    >
      {/* Logo 图标 */}
      <div className="relative z-20">
        <LogoIcon size={size} className="drop-shadow-lg" {...logoColor} />
      </div>

      {/* 动态粒子效果 */}
      {particles.map((particle) => {
        const floatAnimation = createFloatAnimation(
          particle.animationOffsetX,
          particle.animationOffsetY
        )

        return (
          <div
            key={particle.id}
            className={`absolute rounded-full ${css({
              animation: `${floatAnimation} ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`,
              background: `radial-gradient(circle, ${particleColor[0]}, ${particleColor[1]})`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${particle.size}px`,
              willChange: 'transform, opacity' // 优化性能
            })}`}
          />
        )
      })}
    </div>
  )
}

const imagesIntro = {
  description: '便捷高效的 \n图片托管服务',
  tagline: (
    <span>
      基于哔哩哔哩图床API，为您提供稳定可靠的
      <br />
      图片存储解决方案。简单上传， 永久保存，随时访问。
    </span>
  ),
  title: APP_NAME
}

const features = [
  {
    description: '无需注册账号，简单几步即可上传图片，获取永久图片链接。',
    icon: '🚀',
    title: '极速上传'
  },
  {
    description: '基于哔哩哔哩强大的图床API，提供稳定、高速的图片加载体验。',
    icon: '☁️',
    title: '稳定可靠'
  },
  {
    description: '支持多种图片格式，满足您不同场景的图片托管需求。',
    icon: '🖼️',
    title: '多格式支持'
  },
  {
    description:
      '通过IndexedDB技术，在本地持久化存储您的图片记录，随时查看历史上传。',
    icon: '💾',
    title: '本地记录'
  },
  {
    description: '简洁直观的图片预览功能，轻松管理您的所有图片资源。',
    icon: '👁️',
    title: '预览管理'
  },
  {
    description: '完全免费使用，无容量限制，为您的创作提供坚实后盾。',
    icon: '🆓',
    title: '免费无限'
  }
]

// FeatureCard 组件 - 3D悬停效果
interface FeatureCardProps {
  description: string
  icon: string
  title: string
}

function FeatureCard({ description, icon, title }: FeatureCardProps) {
  // 创建动画值
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // 转换为旋转角度
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  // 处理鼠标移动
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()

    // 计算鼠标在卡片上的相对位置
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const posX = event.clientX - centerX
    const posY = event.clientY - centerY

    // 更新动画值
    x.set(posX)
    y.set(posY)
  }

  // 重置卡片位置
  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className="border-border/15 rounded-lg border bg-[#f6f6f7] p-6"
      initial={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)' }}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
        scale: 1.03,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.h2
        className="text-[16px] leading-6 font-bold text-[#3c3c43]"
        style={{ translateZ: 20 }}
      >
        {`${icon} ${title}`}
      </motion.h2>
      <motion.p
        className="pt-2 text-sm leading-6 text-[#67676c]"
        style={{ translateZ: 10 }}
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

function Welcome() {
  const navigate = useNavigate()

  function toUpload() {
    navigate('/upload?tab=upload')
  }

  return (
    <Transition>
      <Container
        className="max-w-[1152px]"
        wrapperClassName="min-[960px]:px-16 min-sm:px-12 px-4"
      >
        <div
          className={cn(
            'intro-container flex flex-col items-center pt-20 pb-14 text-center',
            introContainerCss
          )}
        >
          <div className={cn('main relative z-10 order-2', introMainCss)}>
            <h1 className="heading flex flex-col font-bold">
              <span className="title">{imagesIntro.title}</span>
              <span className="description whitespace-pre-wrap text-gray-800">
                {imagesIntro.description}
              </span>
            </h1>
            <p className="tagline">{imagesIntro.tagline}</p>
            <div className="actions">
              <Button
                size="lg"
                onClick={toUpload}
                className="action bg-primary rounded-full border border-[#5c7cfa] font-bold shadow-md transition-colors hover:border-transparent hover:bg-[#2979f2]"
              >
                开始使用
              </Button>
            </div>
          </div>

          {/* 右侧光晕 Logo */}
          <div className={`image ${introImageCss}`}>
            <div className="image-container">
              <div className="image-bg"></div>

              <ImagesLogo
                size={160}
                particleCount={16}
                logoColor={{
                  fillColor: '#3B82F6',
                  strokeColor: '#1E40AF'
                }}
                particleColor={['#3B82F6', '#1E40AF']}
              />
            </div>
          </div>
        </div>

        {/* 特点卡片列表 */}
        <div className="grid grid-cols-1 gap-4 pb-15 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </Transition>
  )
}

export default Welcome
