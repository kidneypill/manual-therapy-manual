import path from 'path'
import fs from 'fs'
import yaml from 'js-yaml'

const REPO_ROOT = path.resolve(process.cwd(), '..')

export interface ConditionMeta {
  uid: string
  name_en: string
  name_ko: string
  body_region: string[]
  tags: string[]
  academies: string[]
}

export function getConditionMeta(slug: string): ConditionMeta | null {
  try {
    const filePath = path.join(REPO_ROOT, 'Conditions', slug, '_meta.yaml')
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return yaml.load(raw) as ConditionMeta
  } catch {
    return null
  }
}

export function getAllConditionSlugs(): string[] {
  const conditionsDir = path.join(REPO_ROOT, 'Conditions')
  if (!fs.existsSync(conditionsDir)) return []
  return fs.readdirSync(conditionsDir).filter(name => {
    const p = path.join(conditionsDir, name)
    return fs.statSync(p).isDirectory() && !name.startsWith('_')
  })
}

export function getAllConditions(): (ConditionMeta & { slug: string })[] {
  return getAllConditionSlugs()
    .map(slug => {
      const meta = getConditionMeta(slug)
      if (!meta) return null
      return { ...meta, slug }
    })
    .filter((m): m is ConditionMeta & { slug: string } => m !== null)
}
