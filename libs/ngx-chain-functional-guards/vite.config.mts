/// <reference types="vitest" />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { default as swc } from 'unplugin-swc'
import { UserConfig } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(
  () =>
    ({
      root: __dirname,
      cacheDir: '../../node_modules/.vite/libs/ngx-chain-functional-guards',
      plugins: [
        nxViteTsPaths(),
        nxCopyAssetsPlugin(['*.md']),
        swc.vite({
          module: { type: 'nodenext' }
        })
      ],
      test: {
        watch: false,
        globals: true,
        pool: 'threads',
        environment: 'node',
        include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        setupFiles: ['src/test-setup.ts'],
        reporters: ['default'],
        coverage: {
          reportsDirectory: '../../coverage/libs/ngx-chain-functional-guards',
          provider: 'v8' as const
        }
      }
    }) as UserConfig
)
