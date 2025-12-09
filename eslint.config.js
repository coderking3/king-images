import { defineConfig } from '@king-3/eslint-config'

export default defineConfig(
  {
    typescript: true,
    react: true
  },
  {
    rules: {
      // 关闭命名空间
      'typescript/no-namespace': 'off',
      'react-refresh/only-export-components': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'typescript/no-redeclare': 'off'
    }
  }
)
