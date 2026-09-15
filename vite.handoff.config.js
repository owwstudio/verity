import { basename, extname, resolve } from 'node:path'
import { defineConfig } from 'vite'

const sectionNames = [
  'navbar',
  'hero',
  'the-problem',
  'value-pools',
  'industry-pools',
  'decision-flow',
]
const sectionNameSet = new Set(sectionNames)

const entries = {
  shared: resolve('src/handoff/entries/shared.js'),
  ...Object.fromEntries(
    sectionNames.map((name) => [
      name,
      resolve(`src/handoff/entries/${name}.js`),
    ]),
  ),
}

const getAssetPath = (assetInfo) => {
  const sourcePath = assetInfo.originalFileNames?.find((name) =>
    name.replaceAll('\\', '/').includes('src/assets/'),
  )

  if (sourcePath) {
    const normalizedPath = sourcePath.replaceAll('\\', '/')

    return `assets/${normalizedPath.split('src/assets/')[1]}`
  }

  const assetName = assetInfo.names?.[0] ?? assetInfo.name ?? 'asset'

  if (extname(assetName) === '.css') {
    const entryName = basename(assetName, '.css')

    if (entryName === 'shared') return 'shared/shared.css'
    if (sectionNameSet.has(entryName)) {
      return `sections/${entryName}/${entryName}.css`
    }
  }

  return `assets/${assetName}`
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/handoff',
    emptyOutDir: true,
    copyPublicDir: false,
    cssCodeSplit: true,
    cssMinify: false,
    minify: false,
    sourcemap: true,
    manifest: 'manifest.json',
    rollupOptions: {
      input: entries,
      preserveEntrySignatures: 'exports-only',
      output: {
        format: 'es',
        entryFileNames: ({ name }) =>
          name === 'shared'
            ? 'shared/shared.js'
            : `sections/${name}/${name}.js`,
        chunkFileNames: 'shared/chunks/[name].js',
        assetFileNames: getAssetPath,
      },
    },
  },
})
