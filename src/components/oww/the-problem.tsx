import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import theProblemCss from "./the-problem.css?inline";

/**
 * OWW "the problem" section.
 *
 * Markup ported from code/handoff/sections/the-problem/the-problem.html,
 * behaviour from the-problem.js. data-* and ARIA attributes preserved verbatim.
 *
 * Scoping note: every query is scoped to sectionRef EXCEPT the [data-navbar]
 * lookup. That one is deliberately global — this section drives the navbar's
 * glass/released theme while it is pinned, and the navbar is a sibling
 * component rendered by src/routes/layout.tsx. The vendor does the same.
 *
 * Cleanup: the vendor's top-level ScrollTrigger.create() is never torn down in
 * the original. Here its handle is captured and killed, alongside
 * gsap.matchMedia().revert(), so nothing survives unmount.
 *
 * Certifications block: the wording below is the CEO statement of 2026-09-16,
 * not the vendor's. See the commit message for what changed and why.
 */
/*
  Certification globe, CEO 2026-09-17: the wireframe badge carrying the standard's
  name, with meridians running in from both poles to the name band. Drawn rather
  than imported so it inherits the panel's colour and the page's typeface, and so
  the label sets in the same face as the text beside it.

  Geometry: a 96-unit circle, two latitude arcs bowing towards the equator, as in the CEO's sample, and
  three meridians pole to pole — one straight, two bowed out to the sides. The
  meridians are masked across the middle so the name reads on clear ground.
*/
const AssuranceGlobe = component$<{ label: string }>(({ label }) => {
  const band = `globe-band-${label.replace(/\s+/g, "")}`;
  return (
    <svg
      class="the-problem__assurance-globe"
      viewBox="0 0 96 96"
      role="img"
      aria-label={label}
      fill="none"
      stroke="currentColor"
    >
      <mask id={band}>
        {/* Everything outside the name band is drawn; the band itself is cut out. */}
        <rect x="0" y="0" width="96" height="36" fill="#fff" />
        <rect x="0" y="60" width="96" height="36" fill="#fff" />
      </mask>
      {/* The outline holds the mark; the graticule sits a step back from it, which
          is what keeps a wireframe globe from reading as a beach ball. */}
      <circle cx="48" cy="48" r="45" stroke-width="1.1" />
      <g stroke-width="0.9" opacity="0.72">
        {/* The latitudes start and end on the outline itself (x = 48 +/- sqrt(45^2 - 17^2)),
            so they close the sphere instead of stopping in mid-air. The upper one is
            the lower one mirrored, so both bow towards their own pole, CEO
            2026-09-17. */}
        <path d="M6.3 31a46 26 0 0 1 83.4 0" />
        <path d="M6.3 65a46 26 0 0 0 83.4 0" />
        <g mask={`url(#${band})`}>
          {/* Pole to pole, meeting the outline at both ends, CEO 2026-09-17. */}
          <path d="M48 3v90" />
          <path d="M48 3a25 45 0 0 0 0 90" />
          <path d="M48 3a25 45 0 0 1 0 90" />
        </g>
      </g>
      <text
        x="48"
        y="52"
        text-anchor="middle"
        font-size="13"
        stroke="none"
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  );
});

export const TheProblem = component$(() => {
  useStyles$(theProblemCss);
  // The vendor presented the secondary standards as a bare list under
  // aria-label="Assurance standards", which reads as "held". They are on the
  // roadmap, so they are wrapped and labelled. The wrapper keeps the assurance
  // block at exactly three grid children, which its desktop
  // grid-template-columns (primary | divider | secondary) requires.
  useStyles$(`
    /* The headline spans the whole block, so it sits above both the held
       standards and the roadmap rather than heading only the left column.
       The block's desktop grid is primary | divider | secondary, hence 1 / -1
       and the negative top margin that pulls it into the 3rem gap. */
    .the-problem__assurance-headline {
      grid-column: 1 / -1;
      margin: 0 0 -1.5rem;
      color: #fff;
      font-size: 1.75rem;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .the-problem__assurance-roadmap,
    .the-problem__assurance-certifications {
      display: grid;
      gap: 1.25rem;
      align-content: start;
    }
    .the-problem__assurance-roadmap-heading {
      margin: 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `);

  const sectionRef = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async ({ cleanup }) => {
      const section = sectionRef.value;
      if (!section) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const SELECTORS = {
        background: "[data-problem-background]",
        overlay: "[data-problem-overlay]",
        depth: "[data-problem-depth]",
        interlude: "[data-problem-interlude]",
        statement: "[data-problem-statement]",
        closing: "[data-problem-closing]",
        layout: "[data-problem-layout]",
        heading: "[data-problem-heading]",
        timelineItem: "[data-problem-timeline-item]",
        text: "[data-problem-text]",
        word: "[data-problem-word]",
        accentText: "[data-problem-accent-text]",
        principles: "[data-problem-principles]",
        assurance: "[data-problem-assurance]",
        mobileProgress: "[data-problem-mobile-progress]",
        mobileCurrent: "[data-problem-mobile-current]",
        mobileProgressFill: "[data-problem-mobile-progress-fill]",
        navbar: "[data-navbar]",
      };

      const BACKGROUND_STATES = [
        { x: 0, y: 0, scale: 1 },
        { x: "-22.014vw", y: "-42.639vw", scale: 1.232 },
        { x: "32.361vw", y: "1.528vw", scale: 1.348 },
        { x: "42.5vw", y: "-30.278vw", scale: 1.152 },
        { x: "40.035vw", y: "0.868vw", scale: 0.737 },
      ];

      const MOBILE_BACKGROUND_STATES = [
        { xPercent: 0, yPercent: 0, scale: 1.08 },
        { xPercent: -8, yPercent: -3, scale: 1.16 },
        { xPercent: 7, yPercent: -7, scale: 1.22 },
        { xPercent: -10, yPercent: 5, scale: 1.18 },
        { xPercent: 9, yPercent: -4, scale: 1.24 },
        { xPercent: -4, yPercent: 7, scale: 1.12 },
        { xPercent: 5, yPercent: 0, scale: 1.18 },
        { xPercent: 5, yPercent: 0, scale: 1.18 },
      ];

      const setNavbarTheme = (navbar: HTMLElement | null, theme: string) => {
        if (!navbar) return;
        if (theme === "glass") {
          navbar.dataset.navbarTheme = theme;
          return;
        }
        delete navbar.dataset.navbarTheme;
      };
      const setNavbarPosition = (
        navbar: HTMLElement | null,
        position: string,
      ) => {
        if (!navbar) return;
        navbar.dataset.navbarPosition = position;
      };
      const showNavbar = (
        navbar: HTMLElement | null,
        theme: string,
        animate = false,
      ) => {
        if (!navbar) return;
        gsap.killTweensOf(navbar);
        setNavbarPosition(navbar, "fixed");
        setNavbarTheme(navbar, theme);
        if (!animate) {
          gsap.set(navbar, { clearProps: "transform,opacity" });
          return;
        }
        gsap.fromTo(
          navbar,
          { yPercent: -100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
          },
        );
      };
      const releaseNavbar = (navbar: HTMLElement | null, reduced: boolean) => {
        if (!navbar || navbar.dataset.navbarPosition !== "fixed") return;
        gsap.killTweensOf(navbar);
        gsap.to(navbar, {
          yPercent: -100,
          opacity: 0,
          duration: reduced ? 0 : 0.4,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            setNavbarPosition(navbar, "released");
            setNavbarTheme(navbar, "default");
            gsap.set(navbar, { clearProps: "transform,opacity" });
          },
        });
      };

      const addBackgroundState = (
        timeline: gsap.core.Timeline,
        background: Element | null,
        state: Record<string, unknown>,
        position: number,
      ) => {
        if (!background) return;
        timeline.to(
          background,
          { ...state, duration: 0.8, ease: "none" },
          position,
        );
      };

      type SplitText = {
        element: HTMLElement;
        markup: string;
        words: HTMLElement[];
      };

      const splitTextIntoWords = (
        element: HTMLElement | null,
      ): SplitText | null => {
        if (!element) return null;
        const text = element.textContent?.trim() ?? "";
        const markup = element.innerHTML;
        const accessibleText = document.createElement("span");
        const visualText = document.createElement("span");
        const textNodes: Array<{ content: string; accent: boolean }> = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let textNode = walker.nextNode();
        while (textNode) {
          textNodes.push({
            content: textNode.textContent ?? "",
            accent: Boolean(
              textNode.parentElement?.closest(SELECTORS.accentText),
            ),
          });
          textNode = walker.nextNode();
        }
        accessibleText.className = "the-problem__text-accessible";
        accessibleText.textContent = text;
        visualText.className = "the-problem__text-visual";
        visualText.setAttribute("aria-hidden", "true");
        textNodes.forEach(({ content, accent }) => {
          content.match(/\S+|\s+/g)?.forEach((token) => {
            if (/^\s+$/.test(token)) {
              visualText.append(document.createTextNode(token));
              return;
            }
            const wordElement = document.createElement("span");
            wordElement.className = accent
              ? "the-problem__word the-problem__word--accent"
              : "the-problem__word";
            wordElement.dataset.problemWord = "";
            wordElement.dataset.word = token;
            wordElement.textContent = token;
            visualText.append(wordElement);
          });
        });
        element.replaceChildren(accessibleText, visualText);
        return {
          element,
          markup,
          words: gsap.utils.toArray<HTMLElement>(SELECTORS.word, visualText),
        };
      };

      const groupWordsByLine = (splitTexts: SplitText[]) =>
        splitTexts.flatMap(({ words }) => {
          const lines: Array<{ top: number; words: HTMLElement[] }> = [];
          words.forEach((word) => {
            const top = Math.round(word.offsetTop);
            const currentLine = lines.at(-1);
            if (!currentLine || Math.abs(currentLine.top - top) > 1) {
              lines.push({ top, words: [word] });
              return;
            }
            currentLine.words.push(word);
          });
          return lines.map((line) => line.words);
        });

      const addLineFill = (
        timeline: gsap.core.Timeline,
        lines: HTMLElement[][],
        position: number,
      ) => {
        if (!lines.length) return;
        const lineDuration = 0.8 / lines.length;
        const fillTimeline = gsap.timeline({ defaults: { ease: "none" } });
        lines.forEach((words) => {
          const wordDuration = lineDuration / words.length;
          fillTimeline.to(words, {
            "--problem-word-fill": "100%",
            duration: wordDuration,
            stagger: { each: wordDuration },
          });
        });
        timeline.add(fillTimeline, position);
      };

      // Scoped to sectionRef — readme section 6.2.
      const background = section.querySelector<HTMLElement>(
        SELECTORS.background,
      );
      const overlay = section.querySelector(SELECTORS.overlay);
      const depth = section.querySelector(SELECTORS.depth);
      const interlude = section.querySelector(SELECTORS.interlude);
      const statement = section.querySelector<HTMLElement>(SELECTORS.statement);
      const closing = section.querySelector(SELECTORS.closing);
      const layout = section.querySelector(SELECTORS.layout);
      const heading = section.querySelector<HTMLElement>(SELECTORS.heading);
      const timelineItems = gsap.utils.toArray<HTMLElement>(
        SELECTORS.timelineItem,
        section,
      );
      const principles = section.querySelector<HTMLElement>(
        SELECTORS.principles,
      );
      const assurance = section.querySelector<HTMLElement>(SELECTORS.assurance);
      const mobileProgress = section.querySelector<HTMLElement>(
        SELECTORS.mobileProgress,
      );
      const mobileCurrent = section.querySelector<HTMLElement>(
        SELECTORS.mobileCurrent,
      );
      const mobileProgressFill = section.querySelector<HTMLElement>(
        SELECTORS.mobileProgressFill,
      );
      // Deliberately global: the navbar is a sibling component in layout.tsx.
      const navbar = document.querySelector<HTMLElement>(SELECTORS.navbar);

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const media = gsap.matchMedia();

      showNavbar(navbar, "default");

      const navbarTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => showNavbar(navbar, "glass"),
        onEnterBack: () => showNavbar(navbar, "glass", !reducedMotion),
        onLeave: () => releaseNavbar(navbar, reducedMotion),
        onLeaveBack: () => showNavbar(navbar, "default"),
      });

      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          if (timelineItems.length < 4) return undefined;

          const splitTextGroups = timelineItems.map((item) =>
            gsap.utils
              .toArray<HTMLElement>(SELECTORS.text, item)
              .map((t) => splitTextIntoWords(t))
              .filter((t): t is SplitText => Boolean(t)),
          );
          const splitTexts = splitTextGroups.flat();
          const wordLines = splitTextGroups.map((texts) =>
            groupWordsByLine(texts),
          );

          splitTexts.forEach(({ words }) => {
            gsap.set(words, { "--problem-word-fill": "0%" });
          });

          gsap.set(timelineItems, { autoAlpha: 0 });
          gsap.set(timelineItems[0], { y: 0, autoAlpha: 1 });
          gsap.set(timelineItems[1], { y: "36.806vw", autoAlpha: 0.3 });
          gsap.set(timelineItems[2], { y: "73.612vw" });
          gsap.set(timelineItems[3], { y: "113.751vw" });
          gsap.set(principles, { y: "20vh", autoAlpha: 0 });
          gsap.set(assurance, { y: "80vh", autoAlpha: 0 });
          gsap.set(statement, { y: "20vh", autoAlpha: 0 });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          if (overlay)
            timeline.to(
              overlay,
              { opacity: 1, duration: 0.3, ease: "power1.out" },
              0,
            );
          if (layout)
            timeline.to(
              layout,
              { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
              0.05,
            );

          addLineFill(timeline, wordLines[0], 0.08);
          timeline
            .to(
              timelineItems[0],
              { y: "-23.472vw", autoAlpha: 0.3, duration: 0.8, ease: "none" },
              0.6,
            )
            .to(
              timelineItems[1],
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "none" },
              0.6,
            )
            .to(
              timelineItems[2],
              { y: "36.806vw", autoAlpha: 0.3, duration: 0.8, ease: "none" },
              0.6,
            );
          addLineFill(timeline, wordLines[1], 0.65);
          addBackgroundState(timeline, background, BACKGROUND_STATES[1], 0.6);

          timeline
            .to(
              timelineItems[0],
              { y: "-45vw", autoAlpha: 0, duration: 0.8, ease: "none" },
              1.7,
            )
            .to(
              timelineItems[1],
              { y: "-24.097vw", autoAlpha: 0.3, duration: 0.8, ease: "none" },
              1.7,
            )
            .to(
              timelineItems[2],
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "none" },
              1.7,
            )
            .to(
              timelineItems[3],
              { y: "40.139vw", autoAlpha: 0.3, duration: 0.8, ease: "none" },
              1.7,
            );
          addLineFill(timeline, wordLines[2], 1.75);
          addBackgroundState(timeline, background, BACKGROUND_STATES[2], 1.7);

          timeline
            .to(
              timelineItems[1],
              { y: "-45vw", autoAlpha: 0, duration: 0.8, ease: "none" },
              2.8,
            )
            .to(
              timelineItems[2],
              { y: "-36.389vw", autoAlpha: 0.3, duration: 0.8, ease: "none" },
              2.8,
            )
            .to(
              timelineItems[3],
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "none" },
              2.8,
            );
          addLineFill(timeline, wordLines[3], 2.85);
          addBackgroundState(timeline, background, BACKGROUND_STATES[3], 2.8);

          timeline
            .to(
              heading,
              { y: "-12vh", autoAlpha: 0, duration: 0.7, ease: "power1.in" },
              3.9,
            )
            .to(
              timelineItems[2],
              { y: "-60vw", autoAlpha: 0, duration: 0.7, ease: "none" },
              3.9,
            )
            .to(
              timelineItems[3],
              { y: "-35vw", autoAlpha: 0, duration: 0.7, ease: "none" },
              3.9,
            )
            .to(
              principles,
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
              4,
            );
          addBackgroundState(timeline, background, BACKGROUND_STATES[4], 3.9);

          timeline
            .to(
              principles,
              { y: "-80vh", autoAlpha: 0, duration: 0.8, ease: "power1.in" },
              5,
            )
            .to(assurance, { y: 0, duration: 0.8, ease: "power2.out" }, 5)
            .to(
              assurance,
              { autoAlpha: 1, duration: 0.35, ease: "power1.out" },
              5.45,
            )
            .to(depth, { opacity: 1, duration: 0.8, ease: "none" }, 5);

          timeline
            .to(
              assurance,
              { y: "-80vh", autoAlpha: 0, duration: 0.6, ease: "power1.in" },
              6.1,
            )
            .to(interlude, { opacity: 1, duration: 0.8, ease: "none" }, 6.1)
            .to(background, { opacity: 0, duration: 0.8, ease: "none" }, 6.1);

          // Assurance clears first, then the statement follows the same
          // upward reveal language as the principles beat.
          timeline
            .to(
              statement,
              { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" },
              6.75,
            )
            .to(
              statement,
              { y: "-8vh", autoAlpha: 0, duration: 0.6, ease: "power1.in" },
              7.75,
            );

          timeline.to(
            closing,
            { opacity: 1, duration: 0.8, ease: "none" },
            8.15,
          );

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            splitTexts.forEach(({ element, markup, words }) => {
              gsap.set(words, { clearProps: "--problem-word-fill" });
              element.innerHTML = markup;
            });
          };
        },
      );

      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          if (
            !background ||
            !heading ||
            !timelineItems.length ||
            !principles ||
            !assurance ||
            !statement ||
            !mobileProgress ||
            !mobileCurrent ||
            !mobileProgressFill
          ) {
            return undefined;
          }

          const storyCount = timelineItems.length + 3;
          const sceneCount = storyCount + 1;
          let activeScene = -1;
          let backgroundTween: gsap.core.Tween | undefined;

          section.style.setProperty(
            "--problem-mobile-length",
            `${sceneCount * 85}svh`,
          );
          section.dataset.problemMobileScene = "intro";
          gsap.set(background, {
            ...MOBILE_BACKGROUND_STATES[0],
            transformOrigin: "50% 50%",
            willChange: "transform",
          });
          gsap.set(mobileProgressFill, {
            scaleX: 0,
            transformOrigin: "0% 50%",
          });

          const setPosition = (element: HTMLElement, position: string) => {
            element.dataset.problemMobilePosition = position;
          };

          const updateScene = (sceneIndex: number) => {
            activeScene = Math.max(0, Math.min(sceneCount - 1, sceneIndex));
            const isTimelineScene =
              activeScene > 0 && activeScene <= timelineItems.length;
            const timelineIndex = isTimelineScene ? activeScene - 1 : -1;
            const principlesScene = timelineItems.length + 1;
            const assuranceScene = timelineItems.length + 2;
            const statementScene = timelineItems.length + 3;

            section.dataset.problemMobileScene =
              activeScene === 0
                ? "intro"
                : isTimelineScene
                  ? "timeline"
                  : activeScene === principlesScene
                    ? "principles"
                    : activeScene === assuranceScene
                      ? "assurance"
                      : "statement";

            setPosition(heading, activeScene === 0 ? "active" : "before");
            timelineItems.forEach((item, index) => {
              const position =
                index === timelineIndex
                  ? "active"
                  : timelineIndex < 0 && activeScene === 0
                    ? "after"
                    : index < timelineIndex ||
                        activeScene > timelineItems.length
                      ? "before"
                      : "after";
              setPosition(item, position);
            });
            setPosition(
              principles,
              activeScene === principlesScene
                ? "active"
                : activeScene < principlesScene
                  ? "after"
                  : "before",
            );
            setPosition(
              assurance,
              activeScene === assuranceScene
                ? "active"
                : activeScene < assuranceScene
                  ? "after"
                  : "before",
            );
            setPosition(
              statement,
              activeScene === statementScene ? "active" : "after",
            );

            const storyScene = Math.max(0, activeScene);
            mobileCurrent.textContent = String(
              Math.max(1, Math.min(storyCount, storyScene)),
            ).padStart(2, "0");
            mobileProgress.setAttribute("aria-valuenow", String(storyScene));

            backgroundTween?.kill();
            backgroundTween = gsap.to(background, {
              ...MOBILE_BACKGROUND_STATES[activeScene],
              duration: 0.85,
              ease: "power2.inOut",
              overwrite: true,
            });
          };

          const storyTrigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onUpdate: ({ progress: scrollProgress }) => {
              const nextScene = Math.min(
                sceneCount - 1,
                Math.floor(scrollProgress * sceneCount),
              );
              const storyProgress = Math.max(
                0,
                Math.min(
                  1,
                  (scrollProgress * sceneCount - 1) / (sceneCount - 1),
                ),
              );
              gsap.set(mobileProgressFill, { scaleX: storyProgress });
              if (nextScene !== activeScene) updateScene(nextScene);
            },
          });

          updateScene(0);

          return () => {
            storyTrigger.kill();
            backgroundTween?.kill();
            section.style.removeProperty("--problem-mobile-length");
            delete section.dataset.problemMobileScene;
            delete heading.dataset.problemMobilePosition;
            timelineItems.forEach((item) => {
              delete item.dataset.problemMobilePosition;
            });
            delete principles.dataset.problemMobilePosition;
            delete assurance.dataset.problemMobilePosition;
            delete statement.dataset.problemMobilePosition;
            mobileProgress.setAttribute("aria-valuenow", "0");
            mobileCurrent.textContent = "01";
            gsap.set([background, mobileProgressFill], {
              clearProps: "transform,willChange",
            });
          };
        },
      );

      cleanup(() => {
        navbarTrigger.kill();
        media.revert();
        gsap.killTweensOf(navbar);
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="the-problem"
      id="the-problem"
      aria-labelledby="the-problem-title"
      data-problem="data-problem"
    >
      <div
        class="the-problem__sticky"
        data-problem-sticky="data-problem-sticky"
      >
        <div class="the-problem__background" aria-hidden="true">
          <img
            class="the-problem__background-image"
            src="/assets/images/veryti-main-img.webp"
            alt=""
            width="2880"
            height="1600"
            data-problem-background="data-problem-background"
          />
          <div
            class="the-problem__overlay"
            data-problem-overlay="data-problem-overlay"
          ></div>
          <div
            class="the-problem__depth"
            data-problem-depth="data-problem-depth"
          ></div>
          <div
            class="the-problem__interlude"
            data-problem-interlude="data-problem-interlude"
          ></div>
          <div
            class="the-problem__closing"
            data-problem-closing="data-problem-closing"
          >
            <img
              class="the-problem__closing-glow"
              src="/assets/images/problem-closing-glow.svg"
              alt=""
              width="3609"
              height="1194"
            />
          </div>
        </div>
        <div
          class="the-problem__layout container"
          data-problem-layout="data-problem-layout"
        >
          <header
            class="the-problem__heading"
            data-problem-heading="data-problem-heading"
          >
            <span class="the-problem__label">The Problem</span>
            <h2 class="the-problem__title" id="the-problem-title">
              <span class="the-problem__title-line">
                Every system in your company is right
              </span>
              <span class="the-problem__title-line">That is the problem</span>
            </h2>
          </header>
          <ol
            class="the-problem__timeline"
            data-problem-timeline="data-problem-timeline"
          >
            <li
              class="the-problem__timeline-item"
              data-problem-timeline-item="data-problem-timeline-item"
              data-problem-timeline-index="0"
              data-problem-step="1"
            >
              <p
                class="the-problem__text"
                data-problem-text="data-problem-text"
              >
                Ask what a customer is worth, what a supplier truly costs, or
                whether a production line should continue — and you’ll get
                multiple answers. Each is valid within its own system. None is
                authoritative across the enterprise.
              </p>
            </li>
            <li
              class="the-problem__timeline-item"
              data-problem-timeline-item="data-problem-timeline-item"
              data-problem-timeline-index="1"
              data-problem-step="2"
            >
              <p
                class="the-problem__text"
                data-problem-text="data-problem-text"
              >
                So the decision takes time — for reconciliation, for alignment,
                for a version of the truth everyone will sign. When it is
                finally taken, it is defended in a hard to reconstruct
                spreadsheet, and reopened the moment someone asks who approved
                it.
              </p>
            </li>
            <li
              class="the-problem__timeline-item"
              data-problem-timeline-item="data-problem-timeline-item"
              data-problem-timeline-index="2"
              data-problem-step="3"
            >
              <div class="the-problem__costs">
                <p
                  class="the-problem__text"
                  data-problem-text="data-problem-text"
                >
                  That is the cost you are already paying:
                </p>
                <ul class="the-problem__cost-list">
                  <li
                    class="the-problem__cost-item"
                    data-problem-text="data-problem-text"
                  >
                    <span
                      class="the-problem__cost-highlight"
                      data-problem-accent-text="data-problem-accent-text"
                    >
                      Capital allocated once a year
                    </span>
                    , because continuous reallocation cannot be defended.
                  </li>
                  <li
                    class="the-problem__cost-item"
                    data-problem-text="data-problem-text"
                  >
                    <span
                      class="the-problem__cost-highlight"
                      data-problem-accent-text="data-problem-accent-text"
                    >
                      Decisions taken at the speed of reconciliation
                    </span>
                    , not at the speed of the market.
                  </li>
                  <li
                    class="the-problem__cost-item"
                    data-problem-text="data-problem-text"
                  >
                    <span
                      class="the-problem__cost-highlight"
                      data-problem-accent-text="data-problem-accent-text"
                    >
                      Evidence assembled after the fact
                    </span>
                    , at audit cost, from systems that were never asked to
                    remember.
                  </li>
                </ul>
              </div>
            </li>
            <li
              class="the-problem__timeline-item"
              data-problem-timeline-item="data-problem-timeline-item"
              data-problem-timeline-index="3"
              data-problem-step="4"
            >
              <p
                class="the-problem__text"
                data-problem-text="data-problem-text"
              >
                The interfaces are connected. What is missing sits beneath them:
                what each record means, which version applied at the moment it
                mattered, who owns it, what it is worth for this decision, who
                may decide, and what may then happen.
              </p>
            </li>
          </ol>
          <ul
            class="the-problem__principles"
            data-problem-principles="data-problem-principles"
          >
            <li class="the-problem__principle">Entities change.</li>
            <li class="the-problem__principle">Schemas change.</li>
            <li class="the-problem__principle">What happened does not.</li>
          </ul>
          <div
            class="the-problem__assurance"
            aria-label="Assurance standards"
            data-problem-assurance="data-problem-assurance"
          >
            <h3 class="the-problem__assurance-headline">
              Certifications &amp; Compliance
            </h3>
            <div class="the-problem__assurance-certifications">
              <ul class="the-problem__assurance-primary">
                <li class="the-problem__assurance-primary-item">
                  <AssuranceGlobe label="TISAX" />
                  <span class="the-problem__assurance-name">
                    <strong>TISAX 6.0.3</strong>
                    <small>
                      On-site assessment passed; certification body evaluating
                      the results
                    </small>
                  </span>
                </li>
                <li class="the-problem__assurance-primary-item">
                  <AssuranceGlobe label="ISO 27001" />
                  <span class="the-problem__assurance-name">
                    <strong>ISO 27001:2022 Stage 1</strong>
                    <small>
                      On-site assessment passed; certification body evaluating
                      the results
                    </small>
                  </span>
                </li>
                {/*
                GDPR added on CEO instruction 2026-09-18, "we already comply with
                GDPR", which is why the panel is now Certifications & Compliance:
                the GDPR is a regulation in force, not a scheme anyone certifies
                against, so it carries no assessment status like the two above it.
              */}
                <li class="the-problem__assurance-primary-item">
                  <AssuranceGlobe label="GDPR" />
                  <span class="the-problem__assurance-name">
                    <strong>GDPR</strong>
                    <small>
                      Compliant; a regulation in force, not a certification
                      scheme
                    </small>
                  </span>
                </li>
              </ul>
            </div>
            <div class="the-problem__assurance-roadmap">
              <p class="the-problem__assurance-roadmap-heading">
                Next on the roadmap
              </p>
              <ul class="the-problem__assurance-secondary">
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>ISAE 3000</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>ISO 42001</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>ISO 14001</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>ISO 50001</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>NIS 2</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>NIST</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>SOC 2</span>
                </li>
                <li class="the-problem__assurance-secondary-item">
                  <span
                    class="the-problem__assurance-diamond"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>FedRAMP</span>
                </li>
              </ul>
            </div>
          </div>
          <ul
            class="the-problem__statement"
            data-problem-statement="data-problem-statement"
          >
            <li class="the-problem__statement-item">One identity per asset.</li>
            <li class="the-problem__statement-item">One value per decision.</li>
            <li class="the-problem__statement-item">
              One update per new fact.
            </li>
          </ul>
        </div>
        <div
          class="the-problem__mobile-progress"
          role="progressbar"
          aria-label="The problem story progress"
          aria-valuemin={0}
          aria-valuemax={7}
          aria-valuenow={0}
          data-problem-mobile-progress="data-problem-mobile-progress"
        >
          <span class="the-problem__mobile-progress-count">
            <span data-problem-mobile-current="data-problem-mobile-current">
              01
            </span>
            <span aria-hidden="true">/</span>
            <span>07</span>
          </span>
          <span class="the-problem__mobile-progress-track" aria-hidden="true">
            <span
              class="the-problem__mobile-progress-fill"
              data-problem-mobile-progress-fill="data-problem-mobile-progress-fill"
            ></span>
          </span>
        </div>
      </div>
    </section>
  );
});
