import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import industryPoolsCss from "./industry-pools.css?inline";

/**
 * OWW industry-pools section.
 *
 * Markup ported from code/handoff/sections/industry-pools/industry-pools.html,
 * behaviour from industry-pools.js. data-* and ARIA attributes preserved.
 *
 * Rendered inside <ValuePools>'s .value-pools__overlap-stage via its <Slot/>,
 * which is where the vendor's reference index.html places it. See value-pools.tsx.
 */

const OPTIONS: Array<{ label: string; tone: string }> = [
  // Automotive leads the list, CEO 2026-09-17.
  { label: "Automotive", tone: "default" },
  { label: "Connected products", tone: "faint" },
  { label: "Insurance", tone: "soft" },
  { label: "Banking and payments", tone: "muted" },
  { label: "Critical Infrastructure", tone: "strong" },
  { label: "Assurance And Professional Services", tone: "default" },
  { label: "Cross-functional enterprise operations", tone: "soft" },
  { label: "Cloud and technology platforms", tone: "soft" },
];

export const IndustryPools = component$(() => {
  useStyles$(industryPoolsCss);

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
        action: "[data-industry-pools-action]",
        item: "[data-industry-pools-item]",
        option: "[data-industry-pools-option]",
      };

      const listeners: Array<{
        el: EventTarget;
        type: string;
        fn: EventListener;
      }> = [];
      const on = (el: EventTarget, type: string, fn: EventListener) => {
        el.addEventListener(type, fn);
        listeners.push({ el, type, fn });
      };

      // Scoped to sectionRef — readme section 6.2.
      const action = section.querySelector<HTMLElement>(SELECTORS.action);
      const items = gsap.utils.toArray<HTMLElement>(SELECTORS.item, section);
      const options = gsap.utils.toArray<HTMLElement>(
        SELECTORS.option,
        section,
      );
      if (!action || !items.length || !options.length) return;

      const setActiveOption = (activeOption: HTMLElement | null) => {
        const activeIndex = activeOption ? options.indexOf(activeOption) : -1;
        options.forEach((option, index) => {
          const isActive = option === activeOption;
          const isAdjacent =
            activeIndex >= 0 && Math.abs(index - activeIndex) === 1;
          option.dataset.state = isActive ? "active" : "inactive";
          option.setAttribute("aria-pressed", String(isActive));
          if (isAdjacent) option.dataset.proximity = "adjacent";
          else delete option.dataset.proximity;
        });
      };

      const hoverQuery = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );
      setActiveOption(null);

      on(section, "pointerleave", (() => {
        if (hoverQuery.matches && !section.contains(document.activeElement))
          setActiveOption(null);
      }) as EventListener);

      on(section, "focusout", ((event: FocusEvent) => {
        if (!section.contains(event.relatedTarget as Node))
          setActiveOption(null);
      }) as EventListener);

      options.forEach((option) => {
        on(option, "pointerenter", (() => {
          if (hoverQuery.matches) setActiveOption(option);
        }) as EventListener);
        on(option, "focus", (() => setActiveOption(option)) as EventListener);
        on(option, "click", (() => {
          if (hoverQuery.matches) {
            setActiveOption(option);
            return;
          }
          setActiveOption(option.dataset.state === "active" ? null : option);
        }) as EventListener);
        on(option, "keydown", ((event: KeyboardEvent) => {
          if (event.key !== "Escape") return;
          setActiveOption(null);
          option.blur();
        }) as EventListener);
      });

      // The vendor calls gsap.matchMedia() inline and never reverts it. The
      // handle is captured here so cleanup() can.
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(action, { y: 32, scale: 0.96, autoAlpha: 0 });
        gsap.set(items, { y: 32, autoAlpha: 0 });

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 45%",
            toggleActions: "play none none reverse",
          },
        });
        reveal
          .to(items, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
          })
          .to(
            action,
            {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 0.55,
              ease: "power3.out",
            },
            "-=0.16",
          );

        return () => {
          reveal.scrollTrigger?.kill();
          reveal.kill();
          gsap.set([action, ...items], {
            clearProps: "transform,opacity,visibility",
          });
        };
      });

      cleanup(() => {
        listeners.forEach(({ el, type, fn }) =>
          el.removeEventListener(type, fn),
        );
        media.revert();
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="industry-pools"
      aria-label="Industry value pools"
      data-industry-pools="data-industry-pools"
    >
      <div class="industry-pools__inner container">
        <div
          class="industry-pools__action"
          data-industry-pools-action="data-industry-pools-action"
        >
          <a
            class="button button--primary button--with-icon"
            href="/solutions/"
            data-button="primary"
            data-industry-pools-cta="data-industry-pools-cta"
          >
            <span class="button__label">
              See the value pool for your industry
            </span>
            <span class="button__icon" aria-hidden="true">
              <img
                src="/assets/icons/arrow-circle-right.svg"
                alt=""
                width="38"
                height="38"
              />
            </span>
          </a>
        </div>
        <ul class="industry-pools__list" id="industry-pools-list">
          {OPTIONS.map((option) => (
            <li
              class="industry-pools__item"
              key={option.label}
              data-industry-pools-item="data-industry-pools-item"
            >
              <button
                class={`industry-pools__option industry-pools__option--${option.tone}`}
                type="button"
                aria-pressed="false"
                data-state="inactive"
                data-industry-pools-option="data-industry-pools-option"
              >
                <span class="industry-pools__indicator" aria-hidden="true">
                  <img
                    src="/assets/icons/arrow-up-right.svg"
                    alt=""
                    width="64"
                    height="64"
                  />
                </span>
                <span class="industry-pools__label">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
