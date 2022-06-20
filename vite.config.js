import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        include: ['parse-link-header']
    },
    build: {
        commonjsOptions: {
            include: [/parse-link-header/, /node_modules/]
        }
    },
    plugins: [react()],
    define: {
        'process.env': {}
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: './setupTests.js',
        env: "test"
    }
})
