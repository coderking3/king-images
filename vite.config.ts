import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    build: {
      chunkSizeWarningLimit: 2000,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'jse/index-[name]-[hash].js',
          manualChunks: {
            // 动画和视觉效果
            animations: ['framer-motion', 'sonner', 'react-photo-view'],

            // 状态管理和数据存储
            'data-store': [
              'zustand',
              'dexie',
              'dexie-react-hooks',
              'js-cookie'
            ],

            // 表单处理
            'form-utils': ['react-hook-form', '@hookform/resolvers', 'zod'],

            // 网络请求
            network: ['alova', 'axios', '@alova/adapter-axios'],

            // 核心框架
            'react-vendor': ['react', 'react-dom', 'react-router'],

            // UI组件库
            'ui-components': [
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip'
            ],

            // 工具函数
            utils: [
              'react-use',
              'clsx',
              'class-variance-authority',
              'tailwind-merge',
              'uuidjs'
            ],

            // 其他第三方库
            vendors: [
              'qrcode.react',
              'next-themes',
              '@emotion/css',
              'lucide-react'
            ]
          }
        }
      },
      sourcemap: false,
      target: 'es2015'
    },
    esbuild: {
      drop: isBuild ? ['console', 'debugger'] : [],
      legalComments: 'none'
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        'zustand',
        'alova',
        'axios',
        '@alova/adapter-axios',
        'react-use',
        'tailwindcss',
        'framer-motion',
        'sonner'
      ]
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      // 预热文件
      clientFiles: ['./index.html', './src/{pages,layouts,router,store,api}/*'],
      hmr: true,
      host: true,
      port: 3060,
      proxy: {
        // 使用代理解决跨域问题
        '^/api': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          target: 'https://king-images-service.vercel.app/api'
          // target: 'http://localhost:3080/api',
          // target: 'http://192.168.0.104:3080/api'
        }
      }
    }
  }
})
