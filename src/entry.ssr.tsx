import {
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
import Root from "./root";

/** Server-side entry point used by the Qwik City Vite dev server and preview. */
export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    serverData: {
      ...opts.serverData,
    },
  });
}
