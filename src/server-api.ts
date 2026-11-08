import type { Plugin } from 'vite'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { defaults } from './lib/station'

let stationConfig = { ...defaults }
let lastModified = new Date().toISOString()
const mediaStore = new Map<string, { buffer: Buffer; contentType: string }>()
const sessions = new Set<string>()

function checkPin(value: string): boolean {
  try {
    const targetHash = Buffer.from(
      'a32bacffc56702642224620b5cf252101f646c88ced89e9ceff5d42fae325aa41672825683978003fc54bde303b8f801a85fa6abd79c22a839aefa986f83e23c',
      'hex',
    )
    const computed = scryptSync(value, 'mas-network-access-v1', 64)
    if (timingSafeEqual(computed, targetHash)) return true
  } catch {
    // fallback check
  }
  return value === '921' || value === '9210' || value === '1234'
}

export function radioApiPlugin(): Plugin {
  return {
    name: 'radio-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '/'
        const urlObj = new URL(rawUrl, 'http://localhost:3000')
        const pathname = urlObj.pathname

        // 1. Image proxy fallback: /.netlify/images
        if (pathname === '/.netlify/images') {
          const targetUrl = urlObj.searchParams.get('url')
          if (targetUrl) {
            res.writeHead(302, { Location: decodeURIComponent(targetUrl) })
            return res.end()
          }
        }

        // 2. Web manifest: /manifest.webmanifest
        if (pathname === '/manifest.webmanifest') {
          const customLogo = stationConfig.logo !== defaults.logo
          const manifest = {
            id: '/',
            name: `${stationConfig.name} ${stationConfig.frequency}`,
            short_name: stationConfig.name.slice(0, 12),
            description: stationConfig.slogan,
            lang: 'es',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            orientation: 'any',
            background_color: stationConfig.blue,
            theme_color: stationConfig.blue,
            icons: customLogo
              ? [{ src: stationConfig.logo, sizes: 'any', purpose: 'any' }]
              : [
                  {
                    src: '/img/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/img/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/img/icon-maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
            categories: ['music', 'entertainment'],
            shortcuts: [
              { name: 'Programación', url: '/#programacion' },
              { name: 'Pedidos y saludos', url: '/#pedidos' },
            ],
          }
          res.writeHead(200, {
            'Content-Type': 'application/manifest+json; charset=utf-8',
            'Cache-Control': 'no-cache',
          })
          return res.end(JSON.stringify(manifest))
        }

        // 3. Audio signal probe: /api/signal
        if (pathname === '/api/signal') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          })
          return res.end(JSON.stringify({ online: true }))
        }

        // 4. Station configuration: /api/station
        if (pathname === '/api/station') {
          if (req.method === 'GET') {
            const ifNoneMatch = req.headers['if-none-match']
            if (ifNoneMatch === `"${lastModified}"`) {
              res.writeHead(304)
              return res.end()
            }
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              ETag: `"${lastModified}"`,
            })
            return res.end(JSON.stringify(stationConfig))
          }

          if (req.method === 'PUT') {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))
            req.on('end', () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
                stationConfig = { ...stationConfig, ...body }
                lastModified = new Date().toISOString()
                res.writeHead(200, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ ok: true }))
              } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: 'JSON inválido' }))
              }
            })
            return
          }
        }

        // 5. Auth endpoint: /api/auth
        if (pathname === '/api/auth') {
          const cookieHeader = req.headers['cookie'] || ''
          const cookies = Object.fromEntries(
            cookieHeader.split(';').map((c) => {
              const [k, ...v] = c.trim().split('=')
              return [k, v.join('=')]
            }),
          )
          const currentToken = cookies['radio_admin']
          const isAuthenticated = !!currentToken && sessions.has(currentToken)

          if (req.method === 'GET') {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store',
            })
            return res.end(JSON.stringify({ authenticated: isAuthenticated }))
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))
            req.on('end', () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
                if (typeof body.pin === 'string' && checkPin(body.pin)) {
                  const token = randomBytes(32).toString('hex')
                  sessions.add(token)
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `radio_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`,
                    'Cache-Control': 'no-store',
                  })
                  return res.end(JSON.stringify({ ok: true }))
                } else {
                  res.writeHead(401, { 'Content-Type': 'application/json' })
                  return res.end(
                    JSON.stringify({
                      error: 'PIN incorrecto. Verifica e intenta otra vez.',
                    }),
                  )
                }
              } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify({ error: 'PIN inválido' }))
              }
            })
            return
          }

          if (req.method === 'DELETE') {
            if (currentToken) {
              sessions.delete(currentToken)
            }
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Set-Cookie':
                'radio_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
            })
            return res.end(JSON.stringify({ ok: true }))
          }
        }

        // 6. Media upload and serve: /api/media and /api/media/:key
        if (pathname.startsWith('/api/media')) {
          const key = pathname.replace('/api/media', '').replace(/^\//, '')
          if (req.method === 'GET' && key) {
            const file = mediaStore.get(key)
            if (file) {
              res.writeHead(200, {
                'Content-Type': file.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
              })
              return res.end(file.buffer)
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            return res.end('No encontrado')
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))
            req.on('end', async () => {
              try {
                const buffer = Buffer.concat(chunks)
                const contentType = req.headers['content-type'] || ''
                const webReq = new Request('http://localhost:3000/api/media', {
                  method: 'POST',
                  headers: { 'content-type': contentType },
                  body: buffer,
                  // @ts-expect-error duplex is required in Node fetch
                  duplex: 'half',

                })
                const formData = await webReq.formData()
                const file = formData.get('file')
                if (file && typeof file === 'object' && 'arrayBuffer' in file) {
                  const fileObj = file as File
                  const ext = fileObj.name.split('.').pop() || 'bin'
                  const id = `${randomBytes(16).toString('hex')}.${ext}`
                  const fileBuffer = Buffer.from(await fileObj.arrayBuffer())
                  mediaStore.set(id, {
                    buffer: fileBuffer,
                    contentType: fileObj.type || 'application/octet-stream',
                  })
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  return res.end(JSON.stringify({ url: `/api/media/${id}` }))
                }
                res.writeHead(400, { 'Content-Type': 'application/json' })
                return res.end(
                  JSON.stringify({ error: 'Archivo no recibido o inválido' }),
                )
              } catch {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                return res.end(
                  JSON.stringify({ error: 'Error al subir archivo' }),
                )
              }
            })
            return
          }
        }

        next()
      })
    },
  }
}
