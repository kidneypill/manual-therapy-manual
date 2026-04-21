import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const OUT_PATH = path.resolve(__dirname, '../public/search-index.json')

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

// Collect condition sections
const conditionsDir = path.join(REPO_ROOT, 'Conditions')
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

// Collect assessments
const assessDir = path.join(REPO_ROOT, 'Assessments')
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
console.log(`Search index built: ${docs.length} documents → ${OUT_PATH}`)
