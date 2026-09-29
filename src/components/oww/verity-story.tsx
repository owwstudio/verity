import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./verity-story.css?inline";

const METRICS = [
  ["8 Yrs", "Delivering global automotive infrastructure"],
  ["10", "Brands"],
  ["150+", "Markets"],
  ["1,500+", "Endpoints"],
  ["5 Yrs", "In operation"],
  ["99,999%", "Availability"],
] as const;

export const VerityStory = component$(() => {
  useStyles$(css);
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
      const q = <T extends Element>(s: string, root: ParentNode = section) =>
        root.querySelector<T>(s);
      const stage = q<HTMLElement>("[data-verity-story-stage]"),
        overview = q<HTMLElement>("[data-verity-story-overview]"),
        intro = q<HTMLElement>("[data-verity-story-introduction]"),
        metrics = q<HTMLElement>("[data-verity-story-metrics]"),
        lesson = q<HTMLElement>("[data-verity-story-lesson]");
      const lessonCopy = lesson
        ? Array.from(
            lesson.querySelectorAll<HTMLElement>(
              "[data-verity-story-lesson-copy]",
            ),
          )
        : [];
      const portrait =
          lesson && q<HTMLElement>("[data-verity-story-portrait]", lesson),
        image = lesson && q<HTMLElement>("[data-verity-story-image]", lesson);
      if (
        !stage ||
        !overview ||
        !intro ||
        !metrics ||
        !lesson ||
        lessonCopy.length !== 2 ||
        !portrait ||
        !image
      )
        return;
      const counters = Array.from(
        section.querySelectorAll<HTMLElement>("[data-verity-story-counter]"),
      )
        .map((element) => {
          const original = element.textContent.trim(),
            match = original.match(/^([^\d]*)([\d.,]+)(.*)$/);
          if (!match) return null;
          const [, prefix, numeric, suffix] = match,
            decimal = suffix.includes("%") && numeric.includes(","),
            decimals = decimal ? numeric.split(",").at(-1)!.length : 0;
          const end = Number(
            decimal ? numeric.replace(",", ".") : numeric.replaceAll(",", ""),
          );
          if (!Number.isFinite(end)) return null;
          const state = { value: 0 };
          const render = () => {
            const value = decimal
              ? state.value.toFixed(decimals).replace(".", ",")
              : Math.round(state.value).toLocaleString("en-US");
            element.textContent = `${prefix}${value}${suffix}`;
          };
          element.setAttribute("aria-label", original);
          return { element, original, state, end, render };
        })
        .filter((counter): counter is NonNullable<typeof counter> =>
          Boolean(counter),
        );
      const reset = () =>
        counters.forEach((c) => {
          c.state.value = 0;
          c.render();
        });
      const restore = () =>
        counters.forEach((c) => {
          c.element.textContent = c.original;
          c.element.removeAttribute("aria-label");
        });
      const createCounterReveal = () => {
        const counterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
        });
        counters.forEach((counter, index) =>
          counterTimeline.to(
            counter.state,
            {
              value: counter.end,
              duration: 0.8,
              ease: "power2.out",
              onUpdate: counter.render,
            },
            index * 0.1,
          ),
        );
        return counterTimeline;
      };
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          section.style.setProperty("--verity-story-length", "400svh");
          reset();
          const sy = () => stage.clientHeight / 880;
          gsap.set(overview, { autoAlpha: 1 });
          gsap.set(lesson, { autoAlpha: 0 });
          gsap.set(lessonCopy, { y: () => 772 * sy() });
          gsap.set(portrait, {
            y: () => 486 * sy(),
            scaleX: 523 / 264,
            scaleY: 529 / 243,
            transformOrigin: "0 0",
          });
          gsap.set(image, {
            y: () => 1092 * sy(),
            scaleX: 127 / 664,
            scaleY: 76 / 396,
            transformOrigin: "0 0",
          });
          const counterReveal = createCounterReveal();
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(
              metrics,
              { y: () => -656 * sy(), duration: 0.36, ease: "power2.inOut" },
              0.08,
            )
            .to(
              intro,
              {
                y: () => -314 * sy(),
                autoAlpha: 0,
                duration: 0.18,
                ease: "power2.in",
              },
              0.48,
            )
            .to(
              metrics,
              {
                y: () => -935 * sy(),
                autoAlpha: 0,
                duration: 0.2,
                ease: "power2.inOut",
              },
              0.46,
            )
            .to(overview, { autoAlpha: 0, duration: 0.12 }, 0.48)
            .to(lesson, { autoAlpha: 1, duration: 0.1 }, 0.58)
            .to(
              lessonCopy,
              { y: 0, duration: 0.25, stagger: 0.025, ease: "power2.inOut" },
              0.58,
            )
            .to(
              portrait,
              {
                y: 0,
                scaleX: 1,
                scaleY: 1,
                duration: 0.22,
                ease: "power2.inOut",
              },
              0.62,
            )
            .to(
              image,
              {
                y: 0,
                scaleX: 1,
                scaleY: 1,
                duration: 0.24,
                ease: "power2.inOut",
              },
              0.63,
            );
          return () => {
            counterReveal.scrollTrigger?.kill();
            counterReveal.kill();
            timeline.kill();
            section.style.removeProperty("--verity-story-length");
            restore();
          };
        },
      );
      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          reset();
          const counterReveal = createCounterReveal();
          const targets = [intro, metrics, ...lessonCopy, portrait, image];
          const tweens = targets.map((target) =>
            gsap.from(target, {
              y: 28,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }),
          );
          return () => {
            counterReveal.scrollTrigger?.kill();
            counterReveal.kill();
            tweens.forEach((tween) => tween.kill());
            restore();
          };
        },
      );
      cleanup(() => media.revert());
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="verity-story"
      aria-labelledby="verity-story-title"
      data-verity-story
    >
      <div class="verity-story__sticky">
        <div class="verity-story__stage" data-verity-story-stage>
          <div class="verity-story__overview" data-verity-story-overview>
            <div
              class="verity-story__introduction"
              data-verity-story-introduction
            >
              <h2 id="verity-story-title" class="verity-story__title">
                Who is building this, and what is true today
              </h2>
              <p class="verity-story__description">
                You have bought most of the stack. Built by people who have run
                the infrastructure of one of Europe&apos;s largest companies —
                where failure was not an option. None of it does this.
              </p>
            </div>
            <div class="verity-story__metrics-window">
              <ul class="verity-story__metrics" data-verity-story-metrics>
                {METRICS.map(([value, label]) => (
                  <li class="verity-story__metric" key={label}>
                    <strong
                      class="verity-story__metric-value"
                      data-verity-story-counter
                    >
                      {value}
                    </strong>
                    <span class="verity-story__metric-label">{label}</span>
                  </li>
                ))}
              </ul>
              <div
                class="verity-story__metrics-fade verity-story__metrics-fade--top"
                aria-hidden="true"
              />
              <div
                class="verity-story__metrics-fade verity-story__metrics-fade--bottom"
                aria-hidden="true"
              />
            </div>
          </div>
          <div class="verity-story__lesson" data-verity-story-lesson>
            <h2
              class="verity-story__lesson-title"
              data-verity-story-lesson-copy
            >
              The lesson that became Verity
            </h2>
            <div
              class="verity-story__lesson-content"
              data-verity-story-lesson-copy
            >
              <p class="verity-story__lesson-description">
                Connecting systems is not enough. When identity, meaning,
                authority, responsibility and evidence separate as information
                crosses organisational and technical boundaries, decisions slow
                down and accountability disappears. Seven foundational
                innovations exist to keep that chain intact.
              </p>
              <blockquote class="verity-story__quote">
                <p>
                  “We are not asking you to trust a promise. The decision, the
                  authority, the action, and the outcome can be examined
                  independently — both in and against our favor.”
                </p>
                <cite>Helge Heupel, Founder &amp; CEO</cite>
              </blockquote>
            </div>
            <figure class="verity-story__portrait" data-verity-story-portrait>
              <img
                class="verity-story__portrait-media"
                src="/assets/images/verity-founder.png"
                alt="Portrait of Helge Heupel, Founder and CEO of Verity."
                width={1200}
                height={1000}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure class="verity-story__lesson-image" data-verity-story-image>
              <img
                class="verity-story__lesson-image-media"
                src="/assets/images/verity-office.png"
                alt="A bright workspace overlooking the sea."
                width={1200}
                height={680}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
});
