/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // O maior chunk é o CodeMirror, carregado só nas páginas com editor.
  build: { chunkSizeWarningLimit: 600 },
  // O PGlite (PostgreSQL em WebAssembly) carrega seus próprios arquivos .wasm/.data
  // e não pode ser pré-empacotado; roda dentro de um Web Worker em módulo ES.
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  worker: { format: 'es' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
