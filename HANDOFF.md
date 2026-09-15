# Verity section handoff

`npm run build:handoff` creates a readable integration package in
`dist/handoff/`. It does not replace or change the optimized `npm run build`
output.

## Output

```text
dist/handoff/
├── assets/                       # Original fonts, icons, images, and video
├── manifest.json                 # Vite entry/chunk manifest
├── sections.json                 # Stable section file inventory
├── shared/
│   ├── shared.css                # Tokens, reset, typography, objects, utilities
│   ├── shared.js                 # GSAP, ScrollTrigger, and the Lenis singleton
│   └── chunks/                   # Readable shared dependency chunks
└── sections/
    ├── navbar/
    │   ├── navbar.html
    │   ├── navbar.css
    │   └── navbar.js
    ├── hero/
    ├── the-problem/
    ├── value-pools/
    ├── industry-pools/
    └── decision-flow/
```

JavaScript and CSS are not minified. Source maps are included. Entry and asset
names are stable and do not contain content hashes.

## Loading order

Load `shared/shared.css` once, followed by the CSS for each rendered section.
Load `shared/shared.js` once on the client before initializing animated
sections. It owns the single Lenis instance and central GSAP plugin
registration.

Each section JavaScript entry is an ES module that exports its existing
initializer:

```js
import '/handoff/shared/shared.js'
import { initValuePools } from '/handoff/sections/value-pools/value-pools.js'

initValuePools()
```

The Hero entry exports a no-op `initHero` because the section is currently
static.

## React integration

The HTML files are readable fragments for translating into JSX; they are not
React components and should not be inserted with `dangerouslySetInnerHTML`.
Preserve the BEM classes, accessibility attributes, and `data-*` behavior hooks
when converting the fragments.

The current initializers target the page DOM and are suitable for a single
client-side mount. For React components that may mount more than once, port
each initializer into `useEffect`, scope selectors to a component `ref`, and
return cleanup functions for event listeners, GSAP timelines, ScrollTriggers,
and matchMedia contexts.

Lenis must be initialized once at the application shell/provider level, never
inside an individual section component. In SSR frameworks, load the shared
runtime client-side only because Lenis depends on `window`.

## Section composition

In the full Verity page, Industry Pools is nested inside the Value Pools
overlap stage so the Value Pools table can remain sticky while Industry Pools
scrolls over it. The standalone handoff renders both `value-pools.html` and
`industry-pools.html` independently. Recreate the overlap wrapper at the React
page-composition level rather than nesting one React component inside the
other.

## Safety and production

Readable output is safe for front-end handoff, but it is larger than the
production build. Minification is not a security boundary: browser JavaScript
is always inspectable. Do not place secrets, private keys, or server-only logic
in either build.

Use `npm run build` for deployment and `npm run build:handoff` for integration
or review.
