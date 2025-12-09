import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { getSpaceInfo } from '@/api'
import { getCookie, removeCookie, setCookie } from '@/utils'

interface UserInfo {
  avatar: string
  mid: number
  name: string
  sign: string
}

interface Certificate {
  bili_jct: null | string
  SESSDATA: null | string
}

interface UserStore {
  certificate: Certificate | null
  changeUserInfo: (newUserInfo: UserInfo) => void
  fetchSpaceInfo: () => Promise<boolean>
  initUserInfo: () => Promise<void>
  readonly loggedIn: boolean
  setCertificate: (certificate: Certificate | null) => void
  userInfo: null | UserInfo
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Part: state
      certificate:
        getCookie('SESSDATA') && getCookie('bili_jct')
          ? {
              bili_jct: getCookie('bili_jct') || null,
              SESSDATA: getCookie('SESSDATA') || null
            }
          : null,
      userInfo: null,

      // Part: computed
      get loggedIn() {
        const { certificate, userInfo } = get()
        return !!userInfo || !!(certificate && certificate.SESSDATA)
      },

      // Part: actions
      changeUserInfo: (newUserInfo) => {
        set({
          loggedIn: true,
          userInfo: newUserInfo
        })
      },
      fetchSpaceInfo: async () => {
        try {
          const response = await getSpaceInfo()

          // 已经通过alova的responded拦截器处理，直接使用返回值
          if (response.code === 0 && response.data) {
            const { face, mid, name, sign } = response.data

            set({
              loggedIn: true,
              userInfo: {
                avatar: face,
                mid,
                name,
                sign
              }
            })
            return true
          } else {
            set({
              loggedIn: false,
              userInfo: null
            })
            return false
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          set({
            loggedIn: false,
            userInfo: null
          })
          throw error
        }
      },
      initUserInfo: async () => {
        if (get().loggedIn && get().userInfo) {
          return
        }

        const isSuccess = await get().fetchSpaceInfo()
        if (!isSuccess) {
          set({
            certificate: null,
            loggedIn: false,
            userInfo: null
          })
        }
      },
      setCertificate: (certificate) => {
        // 更新状态
        set({
          certificate
        })

        // 同步到 cookie
        if (certificate && certificate.SESSDATA && certificate.bili_jct) {
          // 设置 cookie，有效期30天
          setCookie('SESSDATA', certificate.SESSDATA, { expires: 30 })
          setCookie('bili_jct', certificate.bili_jct, { expires: 30 })

          console.log('111')
          console.log(`🚀 certificate:`, certificate)
        } else {
          // 如果证书为空或无效，清除 cookie
          removeCookie('SESSDATA')
          removeCookie('bili_jct')
        }
      }
    }),
    {
      name: 'king-images-user-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export { useUserStore }
