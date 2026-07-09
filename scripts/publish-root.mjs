import { copyFileSync, cpSync, rmSync, writeFileSync, existsSync } from 'node:fs'

if (!existsSync('dist/index.html')) {
  console.error('dist/index.html missing — run vite build first')
  process.exit(1)
}

copyFileSync('dist/index.html', 'index.html')
if (existsSync('dist/favicon.svg')) {
  copyFileSync('dist/favicon.svg', 'favicon.svg')
}
rmSync('assets', { recursive: true, force: true })
cpSync('dist/assets', 'assets', { recursive: true })
writeFileSync('.nojekyll', '')
console.log('published dist → repository root for GitHub Pages')
