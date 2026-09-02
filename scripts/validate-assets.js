import fs from 'node:fs'
import path from 'node:path'

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
if (!fs.existsSync(PUBLIC_DIR)) process.exit(0)

const files = fs.readdirSync(PUBLIC_DIR)
let hasError = false

console.log('[asset-check] Validating public media assets...')

for (const file of files) {
  const filePath = path.join(PUBLIC_DIR, file)
  const stat = fs.statSync(filePath)
  if (stat.isFile()) {
    const ext = path.extname(file).toLowerCase()
    const isMedia = ['.webm', '.mp4', '.mov', '.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)
    if (isMedia) {
      if (stat.size === 0) {
        console.error('ERROR: 0-BYTE MEDIA ASSET DETECTED: public/' + file)
        console.error('The file is empty (0 bytes)! Build aborted.')
        hasError = true
      } else {
        const sizeFormatted = stat.size > 1024 * 1024 ? (stat.size / 1048576).toFixed(2) + ' MB' : (stat.size / 1024).toFixed(1) + ' KB'
        console.log('  ok public/' + file + ' (' + sizeFormatted + ')')
      }
    }
  }
}

if (hasError) process.exit(1)
console.log('All media assets verified.')
