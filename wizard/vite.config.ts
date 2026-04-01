import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-root-schema',
      configureServer(server) {
        server.middlewares.use('/chartpack/wizard/values.schema.json', (_req, res) => {
          const fs = require('fs')
          const file = path.resolve(__dirname, '../values.schema.json')
          res.setHeader('Content-Type', 'application/json')
          fs.createReadStream(file).pipe(res)
        })
      },
    },
  ],
  base: '/chartpack/wizard/',
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'copy-root-schema',
          generateBundle() {
            const fs = require('fs')
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
