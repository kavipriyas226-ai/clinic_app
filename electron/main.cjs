const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { startStaticServer } = require('./server.cjs')

// Fixed, well-known ports so the desktop app's local origin can be permanently
// allow-listed in the backend's CORS config. Tried in order in case one is busy.
const LOCAL_SERVER_PORTS = [53214, 53215, 53216]

let mainWindow
let localServer

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // `npm run electron:dev` sets this to the Vite dev server for live-reloading
  // during development. Packaged builds (and `npm run electron`) always serve
  // the production dist/ output instead.
  const devServerUrl = process.env.ELECTRON_START_URL

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl)
  } else {
    const distPath = path.join(__dirname, '..', 'dist')
    const { server, port } = await startStaticServer(distPath, LOCAL_SERVER_PORTS)
    localServer = server
    await mainWindow.loadURL(`http://127.0.0.1:${port}/`)
  }

  // Any link the app tries to open in a new window/tab (e.g. target="_blank")
  // opens in the OS browser instead of a second Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (localServer) localServer.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
