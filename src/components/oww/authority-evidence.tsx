import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./authority-evidence.css?inline";

const CRITERIA = [
  [
    "/assets/images/ChartDonut.svg",
    "Business-critical",
    "Decisions need to be made with confidence.",
  ],
  [
    "/assets/images/Gavel.svg",
    "Risk / Legal / Audit",
    "Production is gated by Risk, Legal, Security, or Audit.",
  ],
  [
    "/assets/images/OpenAiLogo.svg",
    "Existing systems",
    "Existing cloud, AI, and enterprise systems need to work together.",
  ],
  [
    "/assets/images/Faders.svg",
    "Regulatory evidence",
    "Decisions must meet regulatory and evidence requirements.",
  ],
] as const;
const STEPS = [
  [
    "/assets/images/fi_152551.svg",
    "Baseline",
    "Understand the current state and establish the baseline.",
  ],
  [
    "/assets/images/fi_14678004.svg",
    "Value Hypothesis",
    "Test the value hypothesis against the 10:1 threshold.",
  ],
  [
    "/assets/images/fi_10130499.svg",
    "Decision",
    "Map the decision and execution chain across systems.",
  ],
  [
    "/assets/images/fi_484613.svg",
    "Execution",
    "Identify control gaps in policy, data, process, and authority.",
  ],
  [
    "/assets/images/fi_535193.svg",
    "Evidence",
    "Agree measurement method and generate evidence for go / no-go.",
  ],
] as const;

export const AuthorityEvidence = component$(() => {
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
      const stage = q<HTMLElement>("[data-authority-evidence-stage]");
      const background = q<HTMLElement>("[data-authority-evidence-background]");
      const rotation = q<HTMLElement>(
        "[data-authority-evidence-background-rotation]",
      );
      const intro = q<HTMLElement>("[data-authority-evidence-scene='intro']");
      const criteria = q<HTMLElement>(
        "[data-authority-evidence-scene='criteria']",
      );
      const proof = q<HTMLElement>("[data-authority-evidence-scene='proof']");
      if (!stage || !background || !rotation || !intro || !criteria || !proof)
        return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          section.style.setProperty("--authority-evidence-length", "600svh");
          const panel = q<HTMLElement>("[data-authority-intro-panel]", intro)!;
          const heading = q<HTMLElement>(
            "[data-authority-intro-heading]",
            intro,
          )!;
          const icon = q<HTMLElement>("[data-authority-intro-icon]", intro)!;
          const copy = q<HTMLElement>("[data-authority-intro-copy]", intro)!;
          const paragraphs = Array.from(
            copy.querySelectorAll<HTMLElement>(
              "[data-authority-copy-paragraph]",
            ),
          );
          const originals = paragraphs.map((p) => p.textContent || "");
          paragraphs.forEach((p, pi) => {
            p.setAttribute("aria-label", originals[pi]);
            p.replaceChildren();
            originals[pi].split(" ").forEach((word, wi, words) => {
              const wordEl = document.createElement("span");
              wordEl.className = "authority-evidence__copy-word";
              wordEl.setAttribute("aria-hidden", "true");
              Array.from(word).forEach((character) => {
                const char = document.createElement("span");
                char.className = "authority-evidence__copy-character";
                char.dataset.authorityCopyCharacter = "";
                char.textContent = character;
                wordEl.append(char);
              });
              p.append(wordEl);
              if (wi < words.length - 1) p.append(document.createTextNode(" "));
            });
          });
          const chars = Array.from(
            copy.querySelectorAll<HTMLElement>(
              "[data-authority-copy-character]",
            ),
          );
          const cards = Array.from(
            criteria.querySelectorAll<HTMLElement>(
              "[data-authority-evidence-card]",
            ),
          );
          const steps = Array.from(
            proof.querySelectorAll<HTMLElement>(
              "[data-authority-evidence-step]",
            ),
          );
          const proofHeading = q<HTMLElement>(
            ".authority-evidence__proof-heading",
            proof,
          )!;
          const proofPanel = q<HTMLElement>(
            ".authority-evidence__proof-panel",
            proof,
          )!;
          const sx = () => stage.clientWidth / 1440,
            sy = () => stage.clientHeight / 900;
          gsap.set(background, { autoAlpha: 0 });
          gsap.set(intro, { x: -32, scale: 0.985, autoAlpha: 0 });
          gsap.set(icon, { x: -4, y: 274, scale: 1.5, transformOrigin: "0 0" });
          gsap.set(copy, { y: 184 });
          gsap.set(chars, { color: "#334d42" });
          gsap.set(criteria, { y: 24, autoAlpha: 0 });
          gsap.set(cards, { y: 48, scale: 0.96, autoAlpha: 0 });
          gsap.set(proof, { autoAlpha: 0 });
          gsap.set(proofHeading, { x: -48 });
          gsap.set(proofPanel, { x: 64 });
          gsap.set(steps, { y: 32, autoAlpha: 0 });
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
            .to(background, { autoAlpha: 1, duration: 0.12 }, 0)
            .to(
              intro,
              {
                x: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.11,
                ease: "power2.out",
              },
              0,
            )
            .to(
              heading,
              { y: -64, autoAlpha: 0, duration: 0.13, ease: "power2.in" },
              0.1,
            )
            .to(
              icon,
              { x: 0, y: 0, scale: 1, duration: 0.24, ease: "power2.inOut" },
              0.1,
            )
            .to(
              copy,
              {
                y: () =>
                  Math.min(
                    0,
                    panel.clientHeight -
                      40 -
                      (copy.offsetTop + copy.scrollHeight),
                  ),
                duration: 0.24,
                ease: "power2.inOut",
              },
              0.1,
            )
            .to(
              chars,
              {
                color: "#fff",
                duration: 0.04,
                stagger: { amount: 0.2, from: "start" },
              },
              0.1,
            )
            .to(
              intro,
              {
                x: -72,
                scale: 0.97,
                autoAlpha: 0,
                duration: 0.13,
                ease: "power2.inOut",
              },
              0.32,
            )
            .to(
              background,
              {
                x: () => -309 * sx(),
                y: () => 155 * sy(),
                duration: 0.2,
                ease: "power2.inOut",
              },
              0.3,
            )
            .to(
              criteria,
              { y: 0, autoAlpha: 1, duration: 0.12, ease: "power2.out" },
              0.39,
            )
            .to(
              cards,
              {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.12,
                stagger: 0.025,
                ease: "power2.out",
              },
              0.43,
            )
            .to(
              criteria,
              {
                y: -32,
                scale: 0.985,
                autoAlpha: 0,
                duration: 0.13,
                ease: "power2.inOut",
              },
              0.68,
            )
            .to(
              background,
              {
                x: () => -535 * sx(),
                y: () => -188 * sy(),
                duration: 0.2,
                ease: "power2.inOut",
              },
              0.66,
            )
            .to(proof, { autoAlpha: 1, duration: 0.1 }, 0.75)
            .to(
              [proofHeading, proofPanel],
              { x: 0, duration: 0.15, ease: "power2.out" },
              0.76,
            )
            .to(
              steps,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.11,
                stagger: 0.018,
                ease: "power2.out",
              },
              0.79,
            );
          return () => {
            timeline.kill();
            section.style.removeProperty("--authority-evidence-length");
            paragraphs.forEach((p, i) => {
              p.removeAttribute("aria-label");
              p.textContent = originals[i];
            });
          };
        },
      );
      media.add(
        "(max-width: 69.999rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const scenes = Array.from(
            section.querySelectorAll<HTMLElement>(
              "[data-authority-evidence-scene]",
            ),
          );
          const tweens = scenes.map((scene) =>
            gsap.from(scene, {
              y: 32,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: scene,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }),
          );
          const bgTween = gsap.fromTo(
            rotation,
            { xPercent: -5, yPercent: -4, scale: 1.08 },
            {
              xPercent: 5,
              yPercent: 4,
              scale: 1.08,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
          return () => {
            tweens.forEach((tween) => tween.kill());
            bgTween.kill();
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
      class="authority-evidence"
      aria-labelledby="authority-evidence-title"
      data-authority-evidence
    >
      <div class="authority-evidence__sticky">
        <div class="authority-evidence__stage" data-authority-evidence-stage>
          <div
            class="authority-evidence__background-frame"
            data-authority-evidence-background
          >
            <div
              class="authority-evidence__background-rotation"
              data-authority-evidence-background-rotation
            >
              <img
                class="authority-evidence__background"
                src="/assets/images/authority-evidence-background.png"
                alt=""
                width={1672}
                height={940}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
          <article
            class="authority-evidence__scene authority-evidence__scene--intro"
            data-authority-evidence-scene="intro"
          >
            <div
              class="authority-evidence__intro-panel authority-evidence__glass"
              data-authority-intro-panel
            >
              <div
                class="authority-evidence__intro-heading"
                data-authority-intro-heading
              >
                <p class="authority-evidence__eyebrow">
                  Authority &amp; Evidence
                </p>
                <h2
                  id="authority-evidence-title"
                  class="authority-evidence__intro-title"
                >
                  Human authority in. Independent proof out.
                </h2>
              </div>
              <img
                class="authority-evidence__intro-icon"
                src="/assets/images/Circuitry.svg"
                alt=""
                width={48}
                height={48}
                data-authority-intro-icon
              />
              <div
                class="authority-evidence__intro-copy"
                data-authority-intro-copy
              >
                {[
                  "Technology brings context together, highlights uncertainty, and coordinates action. People remain accountable for every key decision.",
                  "Once approved, each decision sets enforceable limits on data, policy, system actions, and responsibility.",
                  "Verity records evidence as actions happen. Auditors can verify it offline without a Verity licence, API, infrastructure, or access to unrelated confidential data.",
                ].map((p) => (
                  <p data-authority-copy-paragraph key={p}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </article>
          <article
            class="authority-evidence__scene authority-evidence__scene--criteria"
            data-authority-evidence-scene="criteria"
          >
            <div class="authority-evidence__criteria-heading">
              <p class="authority-evidence__eyebrow">
                Authority &amp; Evidence
              </p>
              <h2 class="authority-evidence__criteria-title">
                Built for consequential decisions
              </h2>
            </div>
            <div class="authority-evidence__criteria-grid">
              {CRITERIA.map(([icon, title, text]) => (
                <div
                  class="authority-evidence__criterion authority-evidence__glass"
                  data-authority-evidence-card
                  key={title}
                >
                  <div class="authority-evidence__card-icon authority-evidence__card-icon--light">
                    <img src={icon} alt="" width={24} height={24} />
                  </div>
                  <div class="authority-evidence__item-copy">
                    <h3 class="authority-evidence__item-title">{title}</h3>
                    <p class="authority-evidence__item-text">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article
            class="authority-evidence__scene authority-evidence__scene--proof"
            data-authority-evidence-scene="proof"
          >
            <div class="authority-evidence__proof-heading">
              <p class="authority-evidence__eyebrow">
                Prove the case before committing
              </p>
              <h2 class="authority-evidence__proof-title">
                Prove the case before committing.
              </h2>
              <p class="authority-evidence__proof-description">
                One consequential decision. 3–4 weeks.
              </p>
            </div>
            <a
              class="authority-evidence__action button button--inverse"
              href="/book-a-demo/"
            >
              Discuss one consequential decision
            </a>
            <div class="authority-evidence__proof-panel authority-evidence__glass">
              <div class="authority-evidence__steps">
                {STEPS.map(([icon, title, text]) => (
                  <div
                    class="authority-evidence__step"
                    data-authority-evidence-step
                    key={title}
                  >
                    <div class="authority-evidence__card-icon authority-evidence__card-icon--green">
                      <img src={icon} alt="" width={24} height={24} />
                    </div>
                    <div class="authority-evidence__item-copy">
                      <h3 class="authority-evidence__item-title">{title}</h3>
                      <p class="authority-evidence__item-text">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
});
