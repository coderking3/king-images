import { defineConfig } from '@king-3/eslint-config'

export default defineConfig(
  {
    typescript: true,
    react: true
  },
  {
    rules: {
      // 关闭命名空间
      'typescript/no-namespace': 'off'
    }
  }
)
