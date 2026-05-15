import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'PRD.md')
  const content = fs.readFileSync(filePath, 'utf8')
  res.setHeader('Content-Type', 'text/markdown')
  res.setHeader('Content-Disposition', 'attachment; filename="homepitch-PRD.md"')
  res.send(content)
}
