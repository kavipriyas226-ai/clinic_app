// electron-builder's normal icon-embedding step (rcedit via its bundled "winCodeSign"
// package) fails on this machine because extracting that package requires a Windows
// symlink privilege most accounts don't have. We build with signAndEditExecutable:false
// to skip that broken step, then use the standalone `rcedit` package here — which has no
// such dependency — to set the packaged .exe's icon ourselves before NSIS wraps it up.
import { rcedit } from 'rcedit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Devs Hair & Skin Clinic.exe')
const iconPath = path.join(__dirname, '..', 'electron', 'icon.ico')

await rcedit(exePath, { icon: iconPath })
console.log(`Icon set on ${exePath}`)
