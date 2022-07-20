import {defineConfig, splitVendorChunkPlugin} from 'vite'
import react from '@vitejs/plugin-react'
//import visualizer from "rollup-plugin-visualizer";

export default defineConfig({
    optimizeDeps: {
        include: ['parse-link-header']
    },
    build: {
        commonjsOptions: {
            include: [/parse-link-header/, /node_modules/]
        },
        sourcemap: "hidden",
        rollupOptions: {
            //plugins: [visualizer({template: "sunburst"})],
            output: {
                manualChunks: {
                    calendar: ['@zach.codes/react-calendar'],
                    datefns: ['date-fns'],
                    mui: ['@material-ui/core', '@material-ui/icons', '@mui/icons-material', '@mui/lab', '@mui/material'],
                }
            }
        }
    },
    plugins: [react(), splitVendorChunkPlugin()],
    define: {
        'process.env': {}
    },
    preview: {
        cors: true
    },
    server: {
        host: true,
        port: 3000
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: './setupTests.js',
        env: "test",
        coverage: {
            exclude: ['**/src/test-utils/**', '**/__tests__/**']
        }
    }
})
