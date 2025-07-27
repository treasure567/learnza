import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 8080,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf']
}); 