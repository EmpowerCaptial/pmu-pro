const fs = require('fs')
const path = require('path')

const sourcePath = path.resolve(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.js')
const destinationPath = path.resolve(__dirname, '..', 'public', 'pdf.worker.min.js')

function copyWorker() {
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn('⚠️ pdf.worker.min.js not found at', sourcePath)
      return
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    fs.copyFileSync(sourcePath, destinationPath)
    console.log('✅ Copied pdf.worker.min.js to public directory')
  } catch (error) {
    console.error('❌ Failed to copy pdf.worker.min.js:', error)
    process.exitCode = 1
  }
}

copyWorker()
