import {defineConfig} from 'vite'
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
    build: {
        plugins: [istanbul({
            include: 'src/*',
            exclude: ['node_modules', '**/src/test-utils/**', '**/__tests__/**', '**/*.stories.@(js|jsx|ts|tsx)'],
            extension: ['.js', '.jsx', '.ts', '.tsx'],
            requireEnv: true,
        })]
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: './setupTests.js',
        env: "test",
        coverage: {
            exclude: ['**/src/test-utils/**', '**/__tests__/**'],
            reporter: ['html']
        }
    }
})
