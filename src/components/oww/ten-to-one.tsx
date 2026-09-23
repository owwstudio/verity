import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./ten-to-one.css?inline";

const PRINCIPLES = [
  [
    "01",
    "You choose the measures",
    "Decision time, execution time, revenue, cost, cash conversion, capital utilisation, loss avoided, control effort, audit effort.",
    "/assets/images/ten-to-one-hover-01.png",
  ],
  [
    "02",
    "We verify against your systems",
    "Your systems of record — Your ledger, your ERP, your operational systems. Not Verity telemetry.",
    "/assets/images/ten-to-one-hover-02.png",
  ],
  [
    "03",
    "Finance confirms",
    "Confirmed by your Finance function or an independent reviewer before anything is published.",
    "/assets/images/finance confirm hover.png",
  ],
  [
    "04",
    "Estimates stay estimates",
    "A realised value claim is published only when operational and financial evidence supports it.",
    "/assets/images/ten-to-one-hover-04.png",
  ],
  [
    "05",
    "Negative results count too",
    "Results below forecast — or negative — are published by the same method.",
    "/assets/images/negative result count hover.png",
  ],
] as const;

export const TenToOne = component$(() => {
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
      const q = <T extends Element>(s: string) => section.querySelector<T>(s);
      const sticky = q<HTMLElement>("[data-ten-to-one-sticky]");
      const panel = q<HTMLElement>("[data-ten-to-one-panel]");
      const background = q<HTMLElement>("[data-ten-to-one-background]");
      const intro = q<HTMLElement>("[data-ten-to-one-intro]");
      const threshold = q<HTMLElement>("[data-ten-to-one-threshold]");
      const principles = Array.from(
        section.querySelectorAll<HTMLElement>("[data-ten-to-one-principle]"),
      );
      const images = Array.from(
        section.querySelectorAll<HTMLElement>(
          "[data-ten-to-one-principle-image]",
        ),
      );
      const today = q<HTMLElement>("[data-ten-to-one-today]");
      if (
        !sticky ||
        !panel ||
        !background ||
        !intro ||
        !threshold ||
        principles.length !== 5 ||
        images.length !== 5 ||
        !today
      )
        return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          section.style.setProperty("--ten-to-one-length", "600svh");
          const xShift = () => -249 * (panel.clientWidth / 1408);
          const yShift = () => 346 * (panel.clientHeight / 833);
          gsap.set(background, { x: 0, rotation: 0, scale: 1 });
          gsap.set([intro, threshold], { y: 24, autoAlpha: 0 });
          gsap.set(principles, { autoAlpha: 0 });
          gsap.set(today, { y: 32, autoAlpha: 0 });
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
            .fromTo(
              background,
              { autoAlpha: 0, y: () => panel.clientHeight * 0.78 },
              { autoAlpha: 0.5, y: 0, duration: 0.18, ease: "power2.out" },
              0.08,
            )
            .to(
              [intro, threshold],
              { y: 0, autoAlpha: 1, duration: 0.12, ease: "power2.out" },
              0.16,
            )
            .to(
              principles,
              { autoAlpha: 1, duration: 0.08, stagger: 0.045 },
              0.32,
            )
            .to(
              background,
              { y: () => panel.clientHeight * -0.14, duration: 0.34 },
              0.28,
            )
            .to(
              [intro, threshold, ...principles],
              { y: -24, autoAlpha: 0, duration: 0.1, ease: "power2.in" },
              0.69,
            )
            .to(
              background,
              {
                x: xShift,
                y: yShift,
                rotation: 58.79,
                scale: 1.536,
                duration: 0.2,
                ease: "power2.inOut",
              },
              0.67,
            )
            .to(
              today,
              { y: 0, autoAlpha: 1, duration: 0.13, ease: "power2.out" },
              0.82,
            )
            .to(
              sticky,
              {
                "--ten-to-one-inset": "0rem",
                duration: 0.08,
                ease: "power2.inOut",
              },
              0.84,
            )
            .to(
              panel,
              {
                maxWidth: "100vw",
                maxHeight: "100svh",
                borderRadius: 0,
                backgroundColor: "#00130e",
                duration: 0.08,
                ease: "power2.inOut",
              },
              0.84,
            )
            .to(section, { backgroundColor: "#00130e", duration: 0.08 }, 0.84)
            .to([background, today], { autoAlpha: 0, duration: 0.07 }, 0.93);
          return () => {
            timeline.kill();
            section.style.removeProperty("--ten-to-one-length");
          };
        },
      );
      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const targets = [intro, threshold, ...principles, today];
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
          return () => tweens.forEach((tween) => tween.kill());
        },
      );
      media.add(
        "(max-width: 47.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const tweens = images.map((image, index) =>
            gsap.fromTo(
              image,
              { yPercent: -4, scale: 1.06 },
              {
                yPercent: 4,
                scale: 1.06,
                ease: "none",
                scrollTrigger: {
                  trigger: principles[index],
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              },
            ),
          );
          return () => tweens.forEach((tween) => tween.kill());
        },
      );
      cleanup(() => media.revert());
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="ten-to-one"
      aria-labelledby="ten-to-one-title"
      data-ten-to-one
    >
      <div class="ten-to-one__sticky" data-ten-to-one-sticky>
        <div class="ten-to-one__panel" data-ten-to-one-panel>
          <img
            class="ten-to-one__background"
            src="/assets/images/ten-to-one-background.jpg"
            alt=""
            width={1768}
            height={3834}
            loading="eager"
            decoding="async"
            data-ten-to-one-background
          />
          <div
            class="ten-to-one__proof"
            data-ten-to-one-proof="data-ten-to-one-proof"
          >
            <div class="ten-to-one__intro" data-ten-to-one-intro>
              <p class="ten-to-one__eyebrow">The 10:1 rule</p>
              <h2 id="ten-to-one-title" class="ten-to-one__title">
                We will not ask you to believe a business case. Including ours.
              </h2>
            </div>
            <p class="ten-to-one__threshold" data-ten-to-one-threshold>
              <strong class="ten-to-one__threshold-lead">
                The threshold: 10:1 over five years.
              </strong>
              <span class="ten-to-one__threshold-text">
                {" "}
                An engagement must credibly enable or protect at least ten times
                its cost. If the assessment does not clear that bar, you find
                out in week three — and put the money somewhere it works harder.
              </span>
            </p>
            <ol class="ten-to-one__principles">
              {PRINCIPLES.map(([number, label, description, image], index) => (
                <li
                  class="ten-to-one__principle"
                  data-ten-to-one-principle
                  data-principle-index={index}
                  tabIndex={0}
                  key={number}
                >
                  <div class="ten-to-one__principle-default" aria-hidden="true">
                    <span class="ten-to-one__number">{number}</span>
                    <span class="ten-to-one__label">{label}</span>
                  </div>
                  <div class="ten-to-one__principle-hover">
                    <img
                      class="ten-to-one__principle-image"
                      src={image}
                      alt=""
                      width={904}
                      height={1200}
                      loading="lazy"
                      decoding="async"
                      data-ten-to-one-principle-image
                    />
                    <div class="ten-to-one__principle-shade" />
                    <div class="ten-to-one__principle-content">
                      <div class="ten-to-one__principle-heading">
                        <span class="ten-to-one__hover-number">{number}</span>
                        <span class="ten-to-one__hover-label">{label}</span>
                      </div>
                      <p class="ten-to-one__principle-description">
                        {description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div class="ten-to-one__today" data-ten-to-one-today>
            <div class="ten-to-one__today-heading">
              <p class="ten-to-one__eyebrow">The 10:1 rule</p>
              <h2 class="ten-to-one__today-title">Where we are today</h2>
            </div>
            <div class="ten-to-one__today-copy">
              <p class="ten-to-one__statement">
                Verity is entering its first proof deployments. No
                Verity-attributable customer outcome has been published.
              </p>
              <p class="ten-to-one__detail">
                If you engage now, you are in the first cohort — which is why
                the measurement method above is fixed before the work starts,
                and why the first engagement is bounded, funded from the
                decision&apos;s own budget, and ends in a documented go/no-go.
              </p>
              <a
                class="ten-to-one__action button button--inverse button--with-icon"
                href="/how-it-works/"
              >
                <span>Review the measurement method</span>
                <span class="button__icon">
                  <img src="/assets/icons/arrow-circle-dark.svg" alt="" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
