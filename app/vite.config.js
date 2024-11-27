import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Vite configuration
export default defineConfig({
  plugins: [
    nodePolyfills()  // Automatically polyfills Node.js core modules
  ],
});
