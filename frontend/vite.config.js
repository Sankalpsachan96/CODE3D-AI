import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  base: command === 'build' || mode === 'production' || process.env.NODE_ENV === 'production' ? '/CODE3D-AI/' : '/',
  server: {
    port: 5173,
    open: false,
  },
}));
