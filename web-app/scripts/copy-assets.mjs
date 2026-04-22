import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(__dirname, '../../medicalData/Assets')
const DEST = path.resolve(__dirname, '../public/Assets')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('Assets dir not found, skipping')
    return
  }
  fs.mkdirSync(dest, { recursive: true })
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f)
    const d = path.join(dest, f)
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d)
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

copyDir(SRC, DEST)
console.log('Assets copied to public/Assets')
