import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { isDev } from "@builder.io/qwik/build";

import "./global.css";
// OWW design tokens, Inter Display faces, reset and shared .container/.button/.tag
// primitives. Imported after global.css so the OWW values win where they overlap.
import "./styles-oww-shared.css";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <title>Helge Heupel</title>
        <meta name="description" content="Enterprise Decision Infrastructure" />
      </head>
      <body lang="en">
        <RouterOutlet />
        {/*
          The Qwik service-worker registration was removed on 2026-09-16 for the
          first public go-live. Registering it caused writes to the Cache Storage
          API on every visitor's device — storage on terminal equipment within the
          scope of TDDDG §25(1), for a prefetch performance optimisation rather
          than for anything the visitor asked for. Removing it keeps the site's
          only device storage to the language preference the visitor sets
          themselves, so no consent mechanism is required. See /cookies.

          `src/routes/service-worker.ts` is left in place but is now registered by
          nothing. Restoring prefetch means restoring <ServiceWorkerRegister /> and
          revisiting the /cookies page at the same time.
        */}
      </body>
    </QwikCityProvider>
  );
});
