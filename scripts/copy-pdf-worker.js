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

function resolveWorkerPath(baseDir) {
  const candidates = [
    path.join(baseDir, 'legacy', 'build', 'pdf.worker.min.mjs'),
    path.join(baseDir, 'legacy', 'build', 'pdf.worker.min.js'),
    path.join(baseDir, 'build', 'pdf.worker.min.mjs'),
    path.join(baseDir, 'build', 'pdf.worker.min.js'),
  ]
  return candidates.find(candidate => fs.existsSync(candidate))
}

let sourcePath = resolveWorkerPath(pdfjsDir)
let extension = sourcePath ? path.extname(sourcePath).replace('.', '') : null

if (!sourcePath) {
  const fallbackPackagePath = require.resolve('pdfjs-dist/package.json')
  const fallbackDir = path.dirname(fallbackPackagePath)
  sourcePath = resolveWorkerPath(fallbackDir)
  extension = sourcePath ? path.extname(sourcePath).replace('.', '') : null
}

const destinationDir = path.resolve(__dirname, '..', 'public')
const generatedDir = path.resolve(__dirname, '..', 'generated')
const versionMetaPath = path.join(generatedDir, 'pdfjs-worker-version.json')

function destination(baseName) {
  if (!extension) return path.join(destinationDir, `${baseName}.js`)
  return path.join(destinationDir, `${baseName}.${extension}`)
}

function copyWorker() {
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn('⚠️ pdf.worker.min.js not found after fallback resolution at', sourcePath)
      return
    }

    fs.mkdirSync(destinationDir, { recursive: true })
    fs.copyFileSync(sourcePath, destination('pdf.worker.min'))
    fs.copyFileSync(sourcePath, destination(`pdf.worker.${version}.min`))

    fs.mkdirSync(generatedDir, { recursive: true })
    fs.writeFileSync(
      versionMetaPath,
      JSON.stringify({ version, extension: extension || 'js' }, null, 2)
    )

    console.log(
      `✅ Copied pdf.worker.min.${extension || 'js'} v${version} to public directory`
    )
  } catch (error) {
    console.error('❌ Failed to copy pdf.worker.min.js:', error)
    process.exitCode = 1
  }
}

copyWorker()
