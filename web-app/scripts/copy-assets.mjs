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
  let copied = 0
  let skipped = 0

  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f)
    const d = path.join(dest, f)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) {
      const { copied: c, skipped: sk } = copyDir(s, d)
      copied += c
      skipped += sk
    } else {
      if (fs.existsSync(d)) {
        const destStat = fs.statSync(d)
        if (destStat.mtimeMs >= stat.mtimeMs && destStat.size === stat.size) {
          skipped++
          continue
        }
      }
      fs.copyFileSync(s, d)
      copied++
    }
  }
  return { copied, skipped }
}

const result = copyDir(SRC, DEST)
if (result) {
  console.log(`Assets: ${result.copied} copied, ${result.skipped} skipped (unchanged)`)
}
