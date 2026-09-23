import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./owned-stack.css?inline";

const CONSEQUENCES = [
  {
    image: "/assets/images/owned-stack-isolated.png",
    alt: "Cash, capital, performance, risk, and constraints independently optimised in isolation.",
    title: "Every asset is optimised on its own",
    text: "how it can generate more cash, consume less capital, perform better, or carry less risk within its constraints.",
  },
  {
    image: "/assets/images/owned-stack-portfolio.png",
    alt: "A coordinated portfolio connecting dependencies, competing priorities, scarce resources, and system-wide value.",
    title: "The portfolio is coordinated as a whole",
    text: "across dependencies, competing priorities and scarce resources, so a local improvement cannot quietly destroy value elsewhere.",
  },
];

export const OwnedStack = component$(() => {
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
      const q = <T extends Element>(selector: string) =>
        section.querySelector<T>(selector);
      const stage = q<HTMLElement>("[data-owned-stack-stage]");
      const titleIntro = q<HTMLElement>("[data-owned-stack-title-intro]");
      const titleFinal = q<HTMLElement>("[data-owned-stack-title-final]");
      const description = q<HTMLElement>("[data-owned-stack-description]");
      const track = q<HTMLElement>("[data-owned-stack-track]");
      const followup = q<HTMLElement>("[data-owned-stack-followup]");
      if (
        !stage ||
        !titleIntro ||
        !titleFinal ||
        !description ||
        !track ||
        !followup
      )
        return;

      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          section.style.setProperty("--owned-stack-length", "500svh");
          gsap.set(titleIntro, { width: "max-content", whiteSpace: "nowrap" });
          const startWidth = Math.min(
            Math.ceil(titleIntro.scrollWidth) + 2,
            stage.clientWidth - 96,
          );
          const centeredX = () =>
            stage.clientWidth / 2 - (titleIntro.offsetLeft + startWidth / 2);
          const centeredY = () =>
            stage.clientHeight / 2 -
            (titleIntro.offsetTop + titleIntro.offsetHeight / 2);
          const trackTravel = () =>
            Math.min(
              0,
              stage.clientHeight - 88 - (track.offsetTop + track.offsetHeight),
            );
          const followupTravel = () =>
            Math.min(
              0,
              stage.clientHeight -
                88 -
                (followup.offsetTop + followup.offsetHeight),
            );
          gsap.set(titleIntro, {
            width: startWidth,
            x: centeredX,
            y: centeredY,
            autoAlpha: 0,
          });
          gsap.set(titleFinal, { autoAlpha: 0 });
          gsap.set(description, { y: 24, autoAlpha: 0 });
          gsap.set(track, { y: 64, autoAlpha: 0 });
          gsap.set(followup, { autoAlpha: 0 });
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
            .to(titleIntro, { autoAlpha: 1, duration: 0.12 }, 0.08)
            .to(
              titleIntro,
              {
                x: 0,
                y: 0,
                autoAlpha: 0,
                duration: 0.16,
                ease: "power2.inOut",
              },
              0.24,
            )
            .to(titleFinal, { autoAlpha: 1, duration: 0.12 }, 0.4)
            .to(description, { y: 0, autoAlpha: 1, duration: 0.12 }, 0.44)
            .to(
              track,
              { y: 0, autoAlpha: 1, duration: 0.16, ease: "power2.out" },
              0.48,
            )
            .to(track, { y: trackTravel, duration: 0.38 }, 0.64)
            .to(
              followup,
              {
                y: followupTravel,
                autoAlpha: 1,
                duration: 0.28,
                ease: "power2.out",
              },
              0.74,
            );
          return () => {
            timeline.kill();
            section.style.removeProperty("--owned-stack-length");
            gsap.set([titleIntro, titleFinal, description, track, followup], {
              clearProps: "transform,opacity,visibility,width,whiteSpace",
            });
          };
        },
      );
      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const targets = [titleFinal, description, track, followup];
          const tweens = targets.map((target) =>
            gsap.from(target, {
              y: 32,
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
      cleanup(() => media.revert());
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="owned-stack"
      aria-labelledby="owned-stack-title"
      data-owned-stack
    >
      <div class="owned-stack__sticky">
        <div class="owned-stack__stage" data-owned-stack-stage>
          <p
            class="owned-stack__title owned-stack__title--intro"
            aria-hidden="true"
            data-owned-stack-title-intro
          >
            Why this is not what you already own
          </p>
          <h2
            id="owned-stack-title"
            class="owned-stack__title owned-stack__title--final"
            data-owned-stack-title-final
          >
            Why this is not what you already own
          </h2>
          <p class="owned-stack__description" data-owned-stack-description>
            You have bought most of the stack. None of it does this.
          </p>
          <div class="owned-stack__track" data-owned-stack-track>
            <div class="owned-stack__introduction">
              <h3 class="owned-stack__copy-title">
                Catalogues describe assets
              </h3>
              <p class="owned-stack__copy">
                Integration platforms move data. Policy engines enforce rules.
                Analytics platforms recommend. Workflow platforms execute. Every
                one of them is necessary and none of them is wrong. None of them
                binds economic value to human authority to executed action to
                portable evidence, in a single chain that can be reconstructed
                years later. That binding is the product.
              </p>
            </div>
            <p class="owned-stack__consequences-label">
              Two consequences follow:
            </p>
            <div class="owned-stack__consequences">
              {CONSEQUENCES.map((item) => (
                <article class="owned-stack__consequence" key={item.title}>
                  <img
                    class="owned-stack__image"
                    src={item.image}
                    alt={item.alt}
                    width={664}
                    height={351}
                    loading="eager"
                    decoding="async"
                  />
                  <div class="owned-stack__consequence-copy">
                    <h3 class="owned-stack__copy-title">{item.title}</h3>
                    <p class="owned-stack__copy">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div class="owned-stack__followup" data-owned-stack-followup>
            <div class="owned-stack__followup-copy">
              <h3 class="owned-stack__copy-title">
                And one thing you no longer have to do:
              </h3>
              <p class="owned-stack__copy">
                your organisation never has to agree in advance on what e.g. a
                customer is. It only has to know what happened and who
                authorised it. Entities get redefined. Events do not.
              </p>
            </div>
            <a
              class="owned-stack__action button button--primary button--with-icon"
              href="/how-it-works/"
            >
              <span>Explore the seven key innovations</span>
              <span class="button__icon">
                <img src="/assets/icons/arrow-circle-right.svg" alt="" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
