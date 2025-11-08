const fs = require('fs')
const path = require('path')

function resolvePdfjsPackage() {
  const reactPdfDir = path.dirname(require.resolve('react-pdf/package.json'))
  try {
    return require.resolve('pdfjs-dist/package.json', { paths: [reactPdfDir] })
  } catch (error) {
    return require.resolve('pdfjs-dist/package.json')
  }
}

const pdfjsPackagePath = resolvePdfjsPackage()
const pdfjsDir = path.dirname(pdfjsPackagePath)
const { version } = require(pdfjsPackagePath)

let sourcePath = path.join(pdfjsDir, 'legacy', 'build', 'pdf.worker.min.js')
if (!fs.existsSync(sourcePath)) {
  const fallbackPackagePath = require.resolve('pdfjs-dist/package.json')
  const fallbackDir = path.dirname(fallbackPackagePath)
  sourcePath = path.join(fallbackDir, 'legacy', 'build', 'pdf.worker.min.js')
}
const destinationPath = path.resolve(__dirname, '..', 'public', 'pdf.worker.min.js')

function copyWorker() {
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn('⚠️ pdf.worker.min.js not found after fallback resolution at', sourcePath)
      return
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    fs.copyFileSync(sourcePath, destinationPath)
    console.log(`✅ Copied pdf.worker.min.js v${version} to public directory`)
  } catch (error) {
    console.error('❌ Failed to copy pdf.worker.min.js:', error)
    process.exitCode = 1
  }
}

copyWorker()
