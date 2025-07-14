import { defineConfig } from 'vite'

export default defineConfig({
  // Ensure public directory is properly served
  publicDir: 'public',
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure all assets are copied
    copyPublicDir: true,
    rollupOptions: {
      // Ensure proper handling of dynamic imports
      output: {
        manualChunks: undefined
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Base URL for deployment
  base: './',
  
  // Ensure proper asset handling
  assetsInclude: ['**/*.json', '**/*.jpg', '**/*.png', '**/*.svg']
})
