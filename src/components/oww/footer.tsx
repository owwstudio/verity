import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import footerCss from "./footer.css?inline";

type MenuEntry = { label: string; href?: string };

const MENUS: Array<{ name: string; entries: MenuEntry[] }> = [
  {
    name: "Product",
    entries: [
      { label: "Asset Tokenizer" },
      { label: "Decision Pricer" },
      { label: "SAP Add-in" },
    ],
  },
  {
    name: "Solutions",
    entries: [
      { label: "Automotive" },
      { label: "Connected products" },
      { label: "Insurance" },
      { label: "Banking and payments" },
      { label: "Critical Infrastructure" },
      { label: "Assurance And Professional Services" },
      { label: "Cross-functional enterprise operations" },
      { label: "Cloud and technology platforms" },
    ],
  },
  {
    name: "Company",
    entries: [
      { label: "Careers" },
      { label: "Blog" },
      { label: "Press" },
      { label: "About" },
      { label: "Contact", href: "mailto:contact@helgeheupel.com" },
    ],
  },
  {
    name: "How it works",
    entries: [
      { label: "Evidence" },
      { label: "Security" },
      { label: "Trust" },
      { label: "Patents pending" },
    ],
  },
];

const OFFICES = [
  { name: "San Francisco", x: 159.9, y: 128.4 },
  { name: "Amsterdam", x: 513.6, y: 87.9 },
  { name: "Berlin", x: 537.2, y: 87.5 },
];

export const Footer = component$(() => {
  useStyles$(footerCss);
  const footerRef = useSignal<HTMLElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async ({ cleanup }) => {
      const footer = footerRef.value;
      if (!footer) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const revealItems = Array.from(
        footer.querySelectorAll<HTMLElement>("[data-footer-reveal]"),
      );
      if (!revealItems.length) return;

      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(revealItems, { y: 24, autoAlpha: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "top top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          revealItems.forEach((item, index) => {
            timeline.to(
              item,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.12,
                ease: "power2.out",
              },
              0.04 + index * 0.055,
            );
          });

          return () => timeline.kill();
        },
      );

      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const tweens = revealItems.map((target) =>
            gsap.from(target, {
              y: 40,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 92%",
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
    <footer
      ref={footerRef}
      id="site-footer"
      class="site-footer"
      data-site-footer
    >
      <div class="site-footer__inner">
        <div class="site-footer__lead">
          <a
            class="site-footer__signature"
            href="/"
            aria-label="Helge Heupel home"
          >
            <img
              class="site-footer__mark"
              src="/assets/images/hh-monogram.svg"
              alt=""
              width={85}
              height={94}
              loading="lazy"
              decoding="async"
            />
            <span class="site-footer__brand">Helge Heupel</span>
          </a>

          <ul class="site-footer__lead-links" data-footer-reveal>
            <li class="site-footer__lead-item">
              <a class="site-footer__link" href="/assessment/">
                Assessment
              </a>
            </li>
            <li class="site-footer__lead-item">
              <a class="site-footer__link" href="/assurance/">
                Assurance
              </a>
            </li>
          </ul>

          <a
            class="site-footer__cta"
            href="mailto:contact@helgeheupel.com?subject=Call%20with%20Founder"
            data-footer-reveal
          >
            Call with Founder
          </a>
        </div>

        <nav class="site-footer__menus" aria-label="Footer navigation">
          {MENUS.map((menu) => (
            <div class="site-footer__menu" data-footer-reveal key={menu.name}>
              <h2 class="site-footer__group-name">{menu.name}</h2>
              <ul class="site-footer__list">
                {menu.entries.map((entry) => (
                  <li class="site-footer__item" key={entry.label}>
                    {entry.href ? (
                      <a class="site-footer__link" href={entry.href}>
                        {entry.label}
                      </a>
                    ) : (
                      <span class="site-footer__pending" aria-disabled="true">
                        {entry.label}
                        <span class="site-footer__pending-note">
                          {" "}
                          — coming soon
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div class="site-footer__company">
          <address class="site-footer__address" data-footer-reveal>
            <strong class="site-footer__company-name">Helge Heupel Inc.</strong>
            <span class="site-footer__address-line">
              1 Sansome Street, Suite 1400
            </span>
            <span class="site-footer__address-line">
              San Francisco, CA 94104
            </span>
            <span class="site-footer__address-line">United States</span>
          </address>

          <div class="site-footer__contact" data-footer-reveal>
            <p class="site-footer__contact-details">
              <a
                class="site-footer__company-link"
                href="mailto:email@helgeheupel.com"
              >
                email@helgeheupel.com
              </a>
              <a class="site-footer__company-link" href="tel:+15124176804">
                +1 512 417 6804
              </a>
            </p>
            <ul class="site-footer__legal">
              <li>
                <a class="site-footer__company-link" href="/impressum/">
                  Legal notice
                </a>
              </li>
              <li>
                <a class="site-footer__company-link" href="/privacy/">
                  Privacy policy
                </a>
              </li>
              <li>
                <a class="site-footer__company-link" href="/cookies/">
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          <ul class="site-footer__offices" data-footer-reveal>
            {OFFICES.map((office) => (
              <li key={office.name}>{office.name}</li>
            ))}
          </ul>

          <figure class="site-footer__map" data-footer-reveal>
            <img
              class="site-footer__map-image"
              src="/assets/images/world-minimal.svg"
              alt=""
              width={1000}
              height={389}
              loading="lazy"
              decoding="async"
            />
            <svg
              class="site-footer__marks"
              viewBox="0 0 1000 389"
              aria-hidden="true"
            >
              {OFFICES.map((office) => (
                <circle key={office.name} cx={office.x} cy={office.y} r={7} />
              ))}
            </svg>
            <figcaption class="site-footer__pending-note">
              Offices in San Francisco, Amsterdam and Berlin
            </figcaption>
          </figure>
        </div>
      </div>
    </footer>
  );
});
