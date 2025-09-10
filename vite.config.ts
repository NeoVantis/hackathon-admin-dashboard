import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Build configuration for production
  build: {
    // Enable source maps for debugging (disable in sensitive production environments)
    sourcemap: false,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Manual chunking for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    },
    
    // Output directory
    outDir: 'dist',
    
    // Clean output directory before build
    emptyOutDir: true,
    
    // Minification
    minify: 'esbuild',
    
    // Target browsers
    target: 'esnext'
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: 'localhost'
  },
  
  // Environment variables
  envPrefix: ['VITE_'],
  
  // Define global constants
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
})
