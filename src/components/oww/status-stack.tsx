import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./status-stack.css?inline";

type StatusCard = {
  number: string;
  title: string;
  icon: string;
  mark?: string;
  text?: string;
  note?: string;
  roadmap?: readonly (readonly [string, string])[];
};

const CARDS: readonly StatusCard[] = [
  {
    number: "01",
    title: "First proof deployments",
    icon: "/assets/images/status-icon-01.svg",
    mark: "©",
    text: "Early-stage product entering its first proof deployments.",
  },
  {
    number: "02",
    title: "Patent applications",
    icon: "/assets/images/status-icon-02.svg",
    text: "Seven foundational patent applications filed with the USPTO on 30 June 2026.",
    note: "Filing is not evidence of grant, technical effectiveness, or customer value.",
  },
  {
    number: "03",
    title: "Independent review",
    icon: "/assets/images/status-icon-03.svg",
    text: "Independent review of the complete post-quantum cryptographic implementation is scheduled for Q4 2026.",
    note: "The cryptographic profile is described as post-quantum-hardened, not post-quantum-secure.",
  },
  {
    number: "04",
    title: "Assurance roadmap",
    icon: "/assets/images/status-icon-04.svg",
    roadmap: [
      ["TISAX 2023–2026", "Next assessment 7–9 September 2026"],
      ["ISO 27001", "November 2026"],
      ["ISO 14001 & ISO 50001", "Q4 2026"],
      ["ISAE 3000", "December 2026"],
      ["ISO 42001", "Q1 2027"],
    ],
  },
  {
    number: "05",
    title: "Your keys, your control",
    icon: "/assets/images/status-icon-05.svg",
    mark: "©",
    text: "Signing and encryption keys remain in your own HSM or KMS.",
  },
] as const;
const BACKGROUNDS = [
  [1155, -816],
  [898, -654],
  [632, -417],
  [409, -244],
  [0, 7],
  [-316, 338],
  [-540, 467],
] as const;

export const StatusStack = component$(() => {
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
      const sticky = q<HTMLElement>("[data-status-stack-sticky]"),
        panel = q<HTMLElement>("[data-status-stack-panel]"),
        header = q<HTMLElement>("[data-status-stack-header]"),
        background = q<HTMLElement>("[data-status-stack-background]"),
        action = q<HTMLElement>("[data-status-stack-action]");
      const cards = Array.from(
        section.querySelectorAll<HTMLElement>("[data-status-stack-card]"),
      );
      if (
        !sticky ||
        !panel ||
        !header ||
        !background ||
        !action ||
        cards.length !== 5
      )
        return;
      const headerItems = Array.from(header.children);
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          section.style.setProperty("--status-stack-length", "1000svh");
          const sx = () => panel.clientWidth / 1408,
            sy = () => panel.clientHeight / 833,
            bx = (i: number) => BACKGROUNDS[i][0] * sx(),
            by = (i: number) => BACKGROUNDS[i][1] * sy();
          const width = () => Math.min(panel.clientWidth - 144, 1264);
          gsap.set(sticky, {
            "--status-panel-inset": "0rem",
            "--status-panel-radius": "0rem",
          });
          gsap.set(background, { x: () => bx(0), y: () => by(0) });
          gsap.set(headerItems, { y: 24, autoAlpha: 0 });
          gsap.set(cards, {
            y: () => panel.clientHeight + 448,
            width,
            autoAlpha: 1,
          });
          gsap.set(action, { y: 80, autoAlpha: 0 });
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () =>
                `+=${Math.max(section.offsetHeight - window.innerHeight * 2, 1)}`,
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(
              sticky,
              {
                "--status-panel-inset": "1rem",
                "--status-panel-radius": "2rem",
                duration: 0.1,
                ease: "power2.inOut",
              },
              0.06,
            )
            .to(
              headerItems,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.12,
                stagger: 0.025,
                ease: "power2.out",
              },
              0.08,
            )
            .to(
              background,
              {
                x: () => bx(1),
                y: () => by(1),
                duration: 0.11,
                ease: "power2.inOut",
              },
              0.18,
            )
            .to(cards[0], { y: 0, duration: 0.11, ease: "power3.out" }, 0.18);
          cards.slice(1).forEach((card, index) => {
            const cardIndex = index + 1,
              start = 0.32 + index * 0.14;
            timeline
              .to(
                cards.slice(0, cardIndex),
                {
                  width: (i: number) => width() - 32 * (cardIndex - i),
                  duration: 0.1,
                  ease: "power2.inOut",
                },
                start,
              )
              .to(
                card,
                { y: 0, width, duration: 0.12, ease: "power3.out" },
                start,
              )
              .to(
                background,
                {
                  x: () => bx(cardIndex + 1),
                  y: () => by(cardIndex + 1),
                  duration: 0.13,
                  ease: "power2.inOut",
                },
                start,
              );
          });
          timeline
            .to(
              cards,
              {
                "--status-card-offset": (i: number) => `${i * 0.5}rem`,
                duration: 0.1,
                ease: "power2.inOut",
              },
              0.84,
            )
            .to(
              background,
              {
                x: () => bx(6),
                y: () => by(6),
                duration: 0.12,
                ease: "power2.inOut",
              },
              0.88,
            )
            .to(
              action,
              { y: 0, autoAlpha: 1, duration: 0.11, ease: "power3.out" },
              0.88,
            );
          return () => {
            timeline.kill();
            section.style.removeProperty("--status-stack-length");
          };
        },
      );
      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const tweens = [...headerItems, ...cards, action].map((target) =>
            gsap.from(target, {
              y: 40,
              autoAlpha: 0,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            }),
          );
          return () => tweens.forEach((tween) => tween.kill());
        },
      );
      media.add("(max-width: 69.999rem)", () => {
        let timer = 0;
        const entries = cards.map((card) => ({
          card,
          toggle: card.querySelector<HTMLButtonElement>(
            "[data-status-stack-card-toggle]",
          )!,
          content: card.querySelector<HTMLElement>(
            "[data-status-stack-card-content]",
          )!,
        }));
        const setOpen = (active: HTMLElement) => {
          entries.forEach(({ card, toggle, content }) => {
            const open = card === active;
            card.dataset.state = open ? "open" : "closed";
            toggle.setAttribute("aria-expanded", String(open));
            content.setAttribute("aria-hidden", String(!open));
          });
          window.clearTimeout(timer);
          timer = window.setTimeout(() => ScrollTrigger.refresh(), 460);
        };
        const handlers = entries.map(({ card, toggle }) => {
          const handler = () => {
            if (card.dataset.state !== "open") setOpen(card);
          };
          toggle.addEventListener("click", handler);
          return handler;
        });
        setOpen(cards[0]);
        return () => {
          window.clearTimeout(timer);
          entries.forEach(({ toggle }, i) =>
            toggle.removeEventListener("click", handlers[i]),
          );
        };
      });
      cleanup(() => media.revert());
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="status-stack"
      aria-labelledby="status-stack-title"
      data-status-stack
    >
      <div class="status-stack__sticky" data-status-stack-sticky>
        <div class="status-stack__panel" data-status-stack-panel>
          <img
            class="status-stack__background-accent"
            src="/assets/images/status-background-accent.png"
            alt=""
            width={473}
            height={1024}
            loading="lazy"
            decoding="async"
          />
          <div class="status-stack__background-anchor" aria-hidden="true">
            <img
              class="status-stack__background"
              src="/assets/images/status-background.jpg"
              alt=""
              width={4096}
              height={2731}
              loading="lazy"
              decoding="async"
              data-status-stack-background
            />
          </div>
          <header class="status-stack__header" data-status-stack-header>
            <p class="status-stack__eyebrow">Status</p>
            <h2 id="status-stack-title" class="status-stack__title">
              Status, 26 August 2026
            </h2>
          </header>
          <div class="status-stack__cards">
            {CARDS.map((card, index) => (
              <article
                class="status-stack__card"
                data-status-stack-card
                data-card-index={index}
                data-state={index === 0 ? "open" : "closed"}
                key={card.number}
              >
                <button
                  class="status-stack__card-toggle"
                  type="button"
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`status-stack-card-content-${index}`}
                  data-status-stack-card-toggle
                >
                  <span class="status-stack__toggle-number">{card.number}</span>
                  <img
                    class="status-stack__toggle-icon"
                    src={card.icon}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <span class="status-stack__toggle-title">{card.title}</span>
                  <span
                    class="status-stack__toggle-indicator"
                    aria-hidden="true"
                  />
                </button>
                <div class="status-stack__card-visual">
                  <span class="status-stack__number">{card.number}</span>
                  <img
                    class="status-stack__icon"
                    src={card.icon}
                    alt=""
                    width={172}
                    height={172}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div
                  class="status-stack__card-content"
                  id={`status-stack-card-content-${index}`}
                  data-status-stack-card-content
                >
                  <div class="status-stack__card-copy">
                    <h3 class="status-stack__card-title">{card.title}</h3>
                    {card.roadmap ? (
                      <ol class="status-stack__roadmap">
                        {card.roadmap.map(([title, detail]) => (
                          <li class="status-stack__milestone" key={title}>
                            <strong>{title}</strong>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <>
                        {card.mark && (
                          <p class="status-stack__mark">{card.mark}</p>
                        )}
                        <p class="status-stack__card-text">{card.text}</p>
                        {card.note && (
                          <p class="status-stack__card-note">{card.note}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <a
            class="status-stack__action"
            href="/assurance/"
            data-status-stack-action
          >
            <span>View the current capability and assurance record</span>
            <img
              class="status-stack__action-icon"
              src="/assets/icons/status-arrow.png"
              alt=""
              width={24}
              height={21}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
});
