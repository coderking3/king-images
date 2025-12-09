import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@/components/ui'
import { useUserStore } from '@/store'

const formSchema = z.object({
  bili_jct: z.string().min(1, {
    message: 'bili_jct 不能为空'
  }),
  SESSDATA: z.string().min(1, {
    message: 'SESSDATA 不能为空'
  })
})

interface CertificatePanelProps {
  toggleButton: React.ReactNode
}

function CertificatePanel({ toggleButton }: CertificatePanelProps) {
  const navigate = useNavigate()
  const { fetchSpaceInfo, setCertificate } = useUserStore()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      bili_jct: '',
      SESSDATA: ''
    },
    resolver: zodResolver(formSchema)
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // 存储cookie配置
    await setCertificate({
      bili_jct: data.bili_jct,
      SESSDATA: data.SESSDATA
    })

    console.log('222')
    console.log(`🚀 document.cookie:`, document.cookie)

    const isLogin = await fetchSpaceInfo()
    if (isLogin) {
      navigate('/')
    } else {
      toast.error('凭证错误，获取用户信息失败', {
        action: {
          label: '重试',
          onClick: () => {
            onSubmit(form.getValues())
          }
        },
        description: '请检查凭证是否正确'
      })
    }
    setIsLoading(false)
  }

  return (
    <Card className="relative shadow-lg">
      {/* 左上角的切换按钮 */}
      {toggleButton}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>
          这些凭证用于访问您的B站账号，请勿泄露给他人
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="mb-4 space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
            id="login-form"
          >
            <FormField
              control={form.control}
              name="SESSDATA"
              render={({ field }) => (
                <FormItem>
                  {/* mb-2 block  text-gray-700 dark:text-gray-300 */}
                  <FormLabel className="text-sm font-medium">
                    SESSDATA:
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="shadow-sm"
                      placeholder="请输入SESSDATA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bili_jct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    bili_jct:
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="shadow-sm"
                      placeholder="请输入bili_jct"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="w-full">
          <Button
            className="w-full bg-[#155dfc]"
            type="submit"
            form="login-form"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            保存凭证
          </Button>
        </div>
        <div className="w-full">
          <div className="relative mt-4 mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="text-muted-foreground bg-white px-2 dark:bg-gray-800">
                获取帮助
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-500">
              <span>
                1.&nbsp;
                <a
                  href="https://passport.bilibili.com/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  登录B站网页版
                </a>
              </span>
              <br />
              2. 按F12打开开发者工具
              <br />
              3. 在Application/Storage标签下找到Cookies
              <br />
              4. 找到SESSDATA和bili_jct的值
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CertificatePanel
