import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-root-schema',
      configureServer(server) {
        const base = process.env.VITE_BASE || '/chartpack/wizard/'
        server.middlewares.use(`${base}values.schema.json`, (_req, res) => {
          const file = path.resolve(__dirname, '../values.schema.json')
          res.setHeader('Content-Type', 'application/json')
          fs.createReadStream(file).pipe(res)
        })
      },
    },
  ],
  base: process.env.VITE_BASE || '/chartpack/wizard/',
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'copy-root-schema',
          generateBundle() {
            this.emitFile({
              type: 'asset',
              fileName: 'values.schema.json',
              source: fs.readFileSync(path.resolve(__dirname, '../values.schema.json'), 'utf-8'),
            })
          },
        },
      ],
    },
  },
})
