import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['node_modules', 'e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                global: {
                    lines: 90
                }
            },
            exclude: ['node_modules/', '.next/', 'vitest.config.ts', 'vitest.setup.ts', 'postcss.config.mjs', 'tailwind.config.ts', 'e2e/**']
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './')
        },
    },
})
