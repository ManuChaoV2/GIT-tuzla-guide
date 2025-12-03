import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Read environment variables from .env file if it exists
const envFilePath = join(process.cwd(), '.env');
let env = {};
if (existsSync(envFilePath)) {
  const envContent = readFileSync(envFilePath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
}

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {
      ...env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icp: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal'],
          mapbox: ['mapbox-gl', 'react-map-gl'],
          i18n: ['i18next', 'react-i18next'],
          audio: ['howler'],
          utils: ['axios', 'qrcode.react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/candid', '@dfinity/principal']
  }
});