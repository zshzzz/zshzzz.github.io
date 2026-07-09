import { copyFileSync } from 'node:fs'

copyFileSync('index.vite.html', 'index.html')
console.log('restored Vite entry index.html')
