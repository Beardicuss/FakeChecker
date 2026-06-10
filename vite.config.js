import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // <--- This ensures itch.io can resolve your asset paths correctly
  server: {
    port: 3000,
    open: true,
  },
});