import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Autorise l'URL de Render pour corriger l'erreur "Blocked request"
      allowedHosts: [
        'hotel-irqp.onrender.com'
      ],
      // Garde votre config HMR existante
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
