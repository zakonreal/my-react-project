import react from "@vitejs/plugin-react-swc";
import { defineConfig } from 'vite'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwind()],
    test: {
        globals: true,
        environment: "happy-dom", // jsdom
        setupFiles: ["./src/test/setup.ts"],
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        testTimeout: 10000,
        build: {
            outDir: 'dist'
        },
        thresholds: {
            global: {
                branches: 70,
                functions: 70,
                lines: 70,
                statements: 70
            }
        }
    },
});
