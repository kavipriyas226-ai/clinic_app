const http = require('http')
const fs = require('fs')
const path = require('path')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
}

/**
 * Serves the built frontend (dist/) over plain HTTP on 127.0.0.1, with an SPA
 * fallback to index.html for any path that isn't a real file. This exists purely
 * to give the bundled app a real HTTP origin (React Router's BrowserRouter and
 * Vite's absolute asset paths don't work correctly under file://) — it does not
 * proxy or serve any API traffic. All data requests from the app go straight to
 * the deployed Render backend URL baked into the build.
 */
function requestHandler(rootDir) {
  return (req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    let filePath = path.normalize(path.join(rootDir, urlPath))

    // Guard against path traversal escaping the dist directory.
    if (!filePath.startsWith(rootDir)) {
      filePath = path.join(rootDir, 'index.html')
    }

    fs.stat(filePath, (err, stats) => {
      if (err || stats.isDirectory()) {
        filePath = path.join(rootDir, 'index.html')
      }
      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not found')
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
        res.end(content)
      })
    })
  }
}

function startStaticServer(rootDir, preferredPorts) {
  return new Promise((resolve, reject) => {
    let index = 0

    function tryNext() {
      if (index >= preferredPorts.length) {
        reject(new Error('No available port found for the local app server.'))
        return
      }
      const port = preferredPorts[index++]
      const server = http.createServer(requestHandler(rootDir))

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tryNext()
        } else {
          reject(err)
        }
      })

      server.listen(port, '127.0.0.1', () => {
        resolve({ server, port })
      })
    }

    tryNext()
  })
}

module.exports = { startStaticServer }
