import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important: Use relative paths for Electron to load assets correctly
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});