import { component$, useStyles$ } from "@builder.io/qwik";
import heroCss from "./hero.css?inline";

/**
 * OWW hero.
 *
 * Markup ported from code/handoff/sections/hero/hero.html.
 * hero.js ships as `var initHero = () => void 0` — the section has no runtime
 * behaviour, so there is no useVisibleTask$ here. All data-* and ARIA
 * attributes are preserved verbatim.
 */
export const Hero = component$(() => {
  useStyles$(heroCss);

  return (
    <section class="hero" aria-labelledby="hero-title" data-hero="data-hero">
      <div class="hero__content container">
        <div class="hero__lead">
          <div class="hero__heading">
            <span
              class="tag tag--outline"
              data-tag="outline"
              data-hero-eyebrow="data-hero-eyebrow"
            >
              Enterprise Decision Infrastructure
            </span>
            <h1
              class="hero__title"
              id="hero-title"
              data-hero-title="data-hero-title"
            >
              <span class="hero__title-line hero__title-line--muted">
                Tokenize every asset.
              </span>
              <span class="hero__title-line">
                Optimize the entire enterprise.
              </span>
            </h1>
          </div>
          <ul
            class="hero__platforms"
            aria-label="Supported cloud platforms"
            data-hero-tags="data-hero-tags"
          >
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                Azure
              </span>
            </li>
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                AWS
              </span>
            </li>
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                Google Cloud
              </span>
            </li>
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                Open Telekom Cloud
              </span>
            </li>
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                IONOS Cloud
              </span>
            </li>
            <li class="hero__platform">
              <span class="tag tag--muted" data-tag="muted">
                STACKIT
              </span>
            </li>
          </ul>
        </div>
        <div class="hero__aside">
          <p class="hero__description">
            Helge Heupel gives every asset – line item, contract, machine, and
            model – a governed identity and a decision-specific value. As new
            information arrives, Helge Heupel updates that value and triggers
            capital reallocation when the evidence warrants it – with every
            decision independently verifiable.
          </p>
          <div class="hero__actions">
            <a
              class="button button--primary button--with-icon"
              href="/call-with-founder/"
              data-button="primary"
              data-hero-primary-action="data-hero-primary-action"
            >
              <span class="button__label">Discuss one key decision</span>
              <span class="button__icon" aria-hidden="true">
                <img
                  src="/assets/icons/arrow-circle-right.svg"
                  alt=""
                  width="38"
                  height="38"
                />
              </span>
            </a>
            <a
              class="button button--secondary"
              href="/how-it-works/"
              data-button="secondary"
              data-hero-secondary-action="data-hero-secondary-action"
            >
              <span class="button__label">See the 10:1 rule</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
