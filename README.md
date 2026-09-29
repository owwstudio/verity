# Verity

Verity landing page built with Qwik City, TypeScript, CSS, GSAP, ScrollTrigger, and one shared Lenis instance.

## Requirements

- Node.js 20.3 or newer
- npm

## Commands

```sh
npm install
npm run dev
npm run build.types
npm run lint
npm run build
```

## Structure

```text
public/
└── assets/                  # Fonts, icons, images, and video
src/
├── components/
│   └── oww/                 # Page sections: TSX markup/behaviour + paired CSS
├── routes/
│   ├── index.tsx            # Home-page section composition
│   └── layout.tsx           # Navbar, footer, Lenis, and shared ScrollTrigger setup
├── entry.ssr.tsx
├── global.css
├── root.tsx
└── styles-oww-shared.css
```

Each page section owns its markup and interaction logic in a `.tsx` file and imports a paired `.css` file. Section scripts use `data-*` hooks rather than styling classes. Lenis is initialized only once in `src/routes/layout.tsx`.

The stable pre-refactor Pug implementation remains available on the `Dev` branch.

## Vercel deployment

The Qwik City Vercel Edge adapter builds the client assets and the server route into `.vercel/output`. Run `npm run build` to generate that output locally. The Vercel project must use this repository as its Root Directory, run `npm run build`, and use the Build Output API output in `.vercel/output` rather than an overridden static Output Directory such as `dist`. `vercel.json` selects the Other framework preset and build command; clear any Output Directory override in the Vercel dashboard.

Push this branch to trigger a Git integration deployment, or run `npm run deploy` for a preview deployment through the Vercel CLI. Assign the production domain to a deployment containing this commit if it should serve the fixed site.
