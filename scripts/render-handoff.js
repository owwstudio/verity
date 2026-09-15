import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { cwd } from 'node:process'
import pug from 'pug'

const projectRoot = cwd()
const outputRoot = resolve(projectRoot, 'dist/handoff')
const sectionNames = [
  'navbar',
  'hero',
  'the-problem',
  'value-pools',
  'industry-pools',
  'decision-flow',
]
const siteData = JSON.parse(
  await readFile(resolve(projectRoot, 'src/data/site.json'), 'utf8'),
)

await cp(resolve(projectRoot, 'src/assets'), resolve(outputRoot, 'assets'), {
  recursive: true,
  filter: (source) => !basename(source).startsWith('.'),
})

await Promise.all(
  sectionNames.map(async (name) => {
    const templatePath = resolve(
      projectRoot,
      `src/handoff/templates/${name}.pug`,
    )
    const sectionOutput = resolve(outputRoot, `sections/${name}`)
    const markup = pug
      .renderFile(templatePath, {
        ...siteData,
        handoffStandalone: true,
        pretty: true,
      })
      .replaceAll('/src/assets/', '../../assets/')

    await mkdir(sectionOutput, { recursive: true })
    await writeFile(resolve(sectionOutput, `${name}.html`), `${markup}\n`)
  }),
)

await writeFile(
  resolve(outputRoot, 'sections.json'),
  `${JSON.stringify(
    {
      shared: {
        css: 'shared/shared.css',
        js: 'shared/shared.js',
      },
      sections: Object.fromEntries(
        sectionNames.map((name) => [
          name,
          {
            html: `sections/${name}/${name}.html`,
            css: `sections/${name}/${name}.css`,
            js: `sections/${name}/${name}.js`,
          },
        ]),
      ),
    },
    null,
    2,
  )}\n`,
)
