import { defineConfig } from 'vite';
import crypto from 'node:crypto';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Add the missing hash function to the crypto object
if (!crypto.hash) {
  crypto.hash = (algorithm, data) => {
    const hash = crypto.createHash(algorithm);
    hash.update(data);
    return hash.digest('hex'); // Return as hex string so it has substring method
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Let's use a more specific alias to avoid conflicts with node:crypto
      './crypto': 'crypto-js'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});