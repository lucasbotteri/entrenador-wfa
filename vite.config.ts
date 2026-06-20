/* eslint-disable @typescript-eslint/no-explicit-any */
import { execFileSync } from 'node:child_process'
import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

function contentPlugin() {
  const run = () => execFileSync('npx', ['tsx', 'scripts/build-content.ts'], { stdio: 'inherit' })
  return {
    name: 'wfa-content',
    buildStart() {
      run()
    },
    configureServer(server: any) {
      server.watcher.add(path.resolve(__dirname, 'docs'))
      server.watcher.on('change', (file: string) => {
        if (file.endsWith('.yaml')) run()
      })
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    },
  },
  plugins: [
    contentPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,woff2,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Entrenador WFA',
        short_name: 'WFA',
        description: 'Primeros socorros en lugares remotos — Cadena de Atención a la Víctima',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f4ede0',
        theme_color: '#7a1f1c',
        lang: 'es-AR',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-mask.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
