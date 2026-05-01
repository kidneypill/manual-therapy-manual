import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const OUT_PATH = path.resolve(__dirname, '../public/search-index.json')
const STAMP_PATH = path.resolve(__dirname, '../public/search-index.stamp')

function getMaxMtime(dir) {
  if (!fs.existsSync(dir)) return 0
  let max = 0
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      max = Math.max(max, getMaxMtime(p))
    } else {
      max = Math.max(max, stat.mtimeMs)
    }
  }
  return max
}

const conditionsDir = path.join(REPO_ROOT, 'medicalData', 'Conditions')
const assessDir = path.join(REPO_ROOT, 'medicalData', 'Assessments')

const sourceMtime = Math.max(getMaxMtime(conditionsDir), getMaxMtime(assessDir))

const prevStamp = fs.existsSync(STAMP_PATH) ? parseFloat(fs.readFileSync(STAMP_PATH, 'utf-8')) : 0

if (fs.existsSync(OUT_PATH) && sourceMtime <= prevStamp) {
  console.log('Search index is up-to-date, skipping rebuild')
  process.exit(0)
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n?/, '').trim()
}

function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const k = line.slice(0, colonIdx).trim()
    const v = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (k) fm[k] = v
  }
  return fm
}

const docs = []

if (fs.existsSync(conditionsDir)) {
  for (const slug of fs.readdirSync(conditionsDir)) {
    const slugDir = path.join(conditionsDir, slug)
    if (!fs.statSync(slugDir).isDirectory()) continue

    let nameEn = slug, nameKo = ''
    const metaPath = path.join(slugDir, '_meta.yaml')
    if (fs.existsSync(metaPath)) {
      const metaRaw = fs.readFileSync(metaPath, 'utf-8')
      const nameEnMatch = metaRaw.match(/name_en:\s*["']?(.+?)["']?\n/)
      const nameKoMatch = metaRaw.match(/name_ko:\s*["']?(.+?)["']?\n/)
      if (nameEnMatch) nameEn = nameEnMatch[1].trim()
      if (nameKoMatch) nameKo = nameKoMatch[1].trim()
    }

    for (const file of fs.readdirSync(slugDir)) {
      if (!file.endsWith('.md')) continue
      const content = fs.readFileSync(path.join(slugDir, file), 'utf-8')
      const fm = parseFrontmatter(content)
      const body = stripMarkdown(stripFrontmatter(content))
      const sectionType = (fm.section_type ?? file.replace('.md', '')).toLowerCase()

      docs.push({
        id: fm.uid ?? `${slug}-${sectionType}`,
        conditionSlug: slug,
        sectionType,
        nameEn,
        nameKo,
        excerpt: body.slice(0, 300),
      })
    }
  }
}

if (fs.existsSync(assessDir)) {
  function walkDir(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f)
      if (fs.statSync(p).isDirectory()) {
        walkDir(p)
      } else if (f.endsWith('.md')) {
        const content = fs.readFileSync(p, 'utf-8')
        const fm = parseFrontmatter(content)
        const body = stripMarkdown(stripFrontmatter(content))
        docs.push({
          id: fm.uid ?? f.replace('.md', ''),
          conditionSlug: fm.parent_condition_uid
            ? fm.parent_condition_uid.split('-').slice(1, 4).join('-').toLowerCase()
            : 'unknown',
          sectionType: 'assessment',
          nameEn: fm.name_en ?? f.replace('.md', ''),
          nameKo: fm.name_ko ?? '',
          excerpt: body.slice(0, 300),
        })
      }
    }
  }
  walkDir(assessDir)
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
fs.writeFileSync(OUT_PATH, JSON.stringify(docs, null, 2))
fs.writeFileSync(STAMP_PATH, String(sourceMtime))
console.log(`Search index built: ${docs.length} documents → ${OUT_PATH}`)
