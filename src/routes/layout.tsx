import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Footer } from "~/components/oww/footer";
import { Navbar } from "~/components/oww/navbar";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  // Smooth scroll (Lenis) and the GSAP ScrollTrigger runtime are initialised
  // exactly once, here at the root. Section components must never create their
  // own scroll instance — see code/readme.md §3.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async ({ cleanup }) => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);

      gsap.registerPlugin(ScrollTrigger);

      // Smooth scroll is a motion effect, so it is opt-out for anyone who has asked
      // the operating system to reduce motion. Lenis replaces the browser's native
      // scrolling wholesale; leaving it on for those users overrides an accessibility
      // preference they set deliberately, and `code/readme.md` §3 does not guard it.
      //
      // ScrollTrigger still runs without Lenis — it falls back to the native scroll
      // position, so the sections keep working and simply stop being eased.
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const lenis = prefersReducedMotion
        ? null
        : new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
          });

      let onTick: ((time: number) => void) | null = null;

      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);

        onTick = (time: number) => {
          lenis.raf(time * 1000);
        };

        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);
      }

      // Sections register their own triggers on document-ready; refresh once the
      // scroll proxy is live so start/end positions are measured against Lenis.
      ScrollTrigger.refresh();

      // Keep the reader's place across a resize, CEO 2026-09-17: "whenever we
      // adjust the screensize, the page content must stay the one that is visible
      // before the scaling".
      //
      // The browser preserves the pixel offset, not the content. Crossing 56rem
      // turns the scroll pins on or off, which roughly halves or doubles the page
      // height, so the same offset lands in a different section or at the end.
      //
      // The anchor is the innermost section (or the footer) under the navbar's
      // bottom edge, and how far through it that edge is. A pinned section is
      // measured by its pin-spacer, which is what occupies the document flow. The
      // anchor is recorded while scrolling and frozen from the first resize event,
      // because the browser clamps the scroll position as the page shrinks and those
      // scroll events would otherwise overwrite it. It is re-applied once
      // ScrollTrigger has rebuilt its pins, or after a quiet period if no refresh
      // comes.
      // The navbar is fixed; .navbar-shell around it is not and scrolls away, so
      // the line is read from the navbar itself and kept on screen.
      const anchorLine = () => {
        const bottom =
          document.querySelector(".navbar")?.getBoundingClientRect().bottom ??
          0;
        return Math.min(Math.max(bottom, 0), window.innerHeight / 2);
      };
      const anchorBlocks = () =>
        Array.from(
          document.querySelectorAll<HTMLElement>("main section, footer"),
        );
      const flowBox = (el: HTMLElement) =>
        (el.parentElement?.classList.contains("pin-spacer")
          ? el.parentElement
          : el
        ).getBoundingClientRect();

      let anchor: { index: number; frac: number } | null = null;
      let resizing = false;
      let settleTimer = 0;

      const saveAnchor = () => {
        if (resizing) return;
        const line = anchorLine();
        const blocks = anchorBlocks();
        for (let i = blocks.length - 1; i >= 0; i--) {
          const box = flowBox(blocks[i]);
          if (box.top <= line && box.bottom > line && box.height > 0) {
            anchor = { index: i, frac: (line - box.top) / box.height };
            return;
          }
        }
      };

      const restoreAnchor = () => {
        window.clearTimeout(settleTimer);
        const apply = () => {
          if (!anchor) return;
          const block = anchorBlocks()[anchor.index];
          if (!block) return;
          const box = flowBox(block);
          const target = Math.max(
            0,
            window.scrollY + box.top + anchor.frac * box.height - anchorLine(),
          );
          // Lenis clamps to the page height it last measured; when the page has just
          // grown, that limit is the old, shorter one.
          lenis?.resize();
          if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
          else window.scrollTo({ top: target, behavior: "instant" });
          ScrollTrigger.update();
        };
        apply();
        // Once more on the next frame, after any pin spacing the refresh added.
        requestAnimationFrame(apply);
        // Let the scroll events from the jump itself pass before recording again.
        window.setTimeout(() => {
          resizing = false;
          saveAnchor();
        }, 150);
      };

      const onResize = () => {
        resizing = true;
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(restoreAnchor, 1000);
      };
      const onRefresh = () => {
        if (resizing) restoreAnchor();
      };

      saveAnchor();
      window.addEventListener("scroll", saveAnchor, { passive: true });
      window.addEventListener("resize", onResize);
      ScrollTrigger.addEventListener("refresh", onRefresh);

      cleanup(() => {
        window.removeEventListener("scroll", saveAnchor);
        window.removeEventListener("resize", onResize);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.clearTimeout(settleTimer);
        if (onTick) gsap.ticker.remove(onTick);
        lenis?.destroy();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <>
      <div class="navbar-shell">
        <Navbar />
      </div>
      <main id="main-content">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
