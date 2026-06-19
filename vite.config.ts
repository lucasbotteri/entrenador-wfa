/* eslint-disable @typescript-eslint/no-explicit-any */
import { execFileSync } from 'node:child_process'
import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
  plugins: [contentPlugin(), react()],
})
