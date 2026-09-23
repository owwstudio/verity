import {
  component$,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import css from "./decision-flow.css?inline";

const STEPS = [
  [
    "decision-flow-identify",
    "Identify",
    "Every authorised record gets an enduring cryptographic identity tied to its exact content, version, origin, time and accountable owner. If something is changed or substituted later, you will know.",
  ],
  [
    "decision-flow-understand",
    "Understand",
    "It connects those records to the relevant contract, supplier, asset, forecast, policy, risk, and operational state. Conflicts, assumptions, and unknowns remain visible rather than being silently averaged away.",
  ],
  [
    "decision-flow-decide",
    "Decide",
    "You see which information drives the value case, which policy applies, and who holds the decision right. The accountable person authorizes a bounded action - not an open mandate.",
  ],
  [
    "decision-flow-act",
    "Act",
    "Authorization becomes coordinated execution. Each system receives only the information and the authority its role requires.",
  ],
  [
    "decision-flow-prove",
    "Prove",
    "One portable evidence package binds what was known, what was decided, who authorized it, what every system did, and how the outcome compares with the value case.",
  ],
] as const;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const DecisionFlow = component$(() => {
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
      const header = q<HTMLElement>("[data-decision-flow-header]"),
        content = q<HTMLElement>("[data-decision-flow-content]"),
        backdrop = q<HTMLElement>("[data-decision-flow-backdrop]"),
        divider = q<HTMLElement>("[data-decision-flow-divider]"),
        mediaElement = q<HTMLElement>("[data-decision-flow-media]"),
        video = q<HTMLVideoElement>("[data-decision-flow-video]"),
        evidence = q<HTMLElement>("[data-decision-flow-evidence]"),
        evidencePreview = q<HTMLButtonElement>(
          "[data-decision-flow-evidence-preview]",
        ),
        progress = q<HTMLElement>("[data-decision-flow-progress]"),
        progressBar = q<HTMLElement>("[data-decision-flow-progress-bar]");
      const steps = Array.from(
        section.querySelectorAll<HTMLElement>("[data-decision-flow-step]"),
      );
      const reveal = Array.from(
        section.querySelectorAll<HTMLElement>("[data-decision-flow-reveal]"),
      );
      const webm = video?.querySelector<HTMLSourceElement>(
          "[data-decision-flow-video-webm]",
        ),
        mov = video?.querySelector<HTMLSourceElement>(
          "[data-decision-flow-video-mov]",
        );
      if (
        !header ||
        !content ||
        !backdrop ||
        !divider ||
        !mediaElement ||
        !video ||
        !webm ||
        !mov ||
        !evidence ||
        !evidencePreview ||
        !progress ||
        !progressBar ||
        !steps.length
      )
        return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const listeners: Array<[EventTarget, string, EventListener]> = [];
      const on = (el: EventTarget, type: string, handler: EventListener) => {
        el.addEventListener(type, handler);
        listeners.push([el, type, handler]);
      };
      let activeIndex = 0,
        duration = 23,
        ready = false,
        seeking = false,
        frame = 0,
        previous = performance.now();
      const videoProgress = { current: 0, target: 0 };
      const updateVideo = () => {
        if (!ready || seeking) return;
        const target = videoProgress.current * duration;
        if (Math.abs(video.currentTime - target) <= 0.015) return;
        seeking = true;
        try {
          video.currentTime = target;
        } catch {
          seeking = false;
        }
      };
      const setVideoProgress = (value: number, immediate = false) => {
        videoProgress.target = clamp(value);
        if (immediate || reduced) {
          videoProgress.current = videoProgress.target;
          updateVideo();
        }
      };
      const renderFrame = (time: number) => {
        const dt = Math.min((time - previous) / 1000, 0.1),
          difference = videoProgress.target - videoProgress.current;
        previous = time;
        videoProgress.current +=
          difference * (1 - Math.exp(-0.1 * 60 * Math.max(dt, 0)));
        if (Math.abs(difference) < 0.00005)
          videoProgress.current = videoProgress.target;
        updateVideo();
        frame = requestAnimationFrame(renderFrame);
      };
      const activate = (index: number, immediate = false, syncVideo = true) => {
        if (
          index < 0 ||
          index >= steps.length ||
          (index === activeIndex && !immediate)
        )
          return;
        activeIndex = index;
        steps.forEach((step, i) => {
          const active = i === index;
          step.dataset.state = active ? "active" : "inactive";
          step
            .querySelector("[data-decision-flow-trigger]")
            ?.setAttribute("aria-expanded", String(active));
          step
            .querySelector("[data-decision-flow-details]")
            ?.setAttribute("aria-hidden", String(!active));
        });
        if (syncVideo) setVideoProgress(index / (steps.length - 1), immediate);
      };
      const safari =
        /safari/i.test(navigator.userAgent) &&
        !/(chrome|chromium|crios|android)/i.test(navigator.userAgent);
      video.preload = "auto";
      video.src = safari ? mov.src : webm.src;
      video.load();
      frame = requestAnimationFrame(renderFrame);
      on(video, "loadedmetadata", (() => {
        if (Number.isFinite(video.duration)) duration = video.duration;
        ready = true;
        setVideoProgress(videoProgress.target, true);
        ScrollTrigger.refresh();
      }) as EventListener);
      on(video, "seeked", (() => {
        seeking = false;
      }) as EventListener);
      const unlock = async () => {
        try {
          await video.play();
          video.pause();
          setVideoProgress(videoProgress.target, true);
        } catch {
          /* autoplay remains locked until the next gesture */
        }
      };
      on(document, "touchstart", unlock as EventListener);
      on(document, "click", unlock as EventListener);
      steps.forEach((step, index) => {
        const trigger = step.querySelector<HTMLElement>(
          "[data-decision-flow-trigger]",
        );
        if (!trigger) return;
        on(trigger, "click", (() => activate(index)) as EventListener);
        on(trigger, "keydown", ((event: KeyboardEvent) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const target =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? steps.length - 1
                : event.key === "ArrowDown"
                  ? (index + 1) % steps.length
                  : (index - 1 + steps.length) % steps.length;
          activate(target);
          steps[target]
            .querySelector<HTMLElement>("[data-decision-flow-trigger]")
            ?.focus();
        }) as EventListener);
      });
      activate(0, true);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () =>
        gsap.fromTo(
          backdrop,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        ),
      );
      media.add(
        "(min-width: 56rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const desktop = window.matchMedia("(min-width: 70rem)");
          const updateLength = () =>
            section.style.setProperty(
              "--decision-flow-length",
              `${Math.max((steps.length + (desktop.matches ? 3 : 2)) * 100, Math.round(duration * 50))}svh`,
            );
          updateLength();
          const headerTargets = reveal.slice(0, 3),
            contentTargets = reveal.slice(3);
          gsap.set(headerTargets, { y: 28, autoAlpha: 0 });
          gsap.set(divider, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(content, { yPercent: 65, autoAlpha: 0 });
          gsap.set(contentTargets, { y: 28, autoAlpha: 0 });
          gsap.set(mediaElement, { y: 32, scale: 0.94, autoAlpha: 0 });
          const revealTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top 35%",
                toggleActions: "play none none reverse",
              },
            })
            .to(headerTargets, {
              y: 0,
              autoAlpha: 1,
              duration: 0.45,
              stagger: 0.14,
              ease: "power3.out",
            })
            .to(divider, { scaleX: 1, duration: 0.45, ease: "power2.out" });
          const introTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${innerHeight}`,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            })
            .to(header, { yPercent: -18, autoAlpha: 0, duration: 1 }, 0)
            .to(divider, { autoAlpha: 0, duration: 0.45 }, 0)
            .to(content, { yPercent: 0, autoAlpha: 1, duration: 1 }, 0)
            .to(
              contentTargets,
              { y: 0, autoAlpha: 1, duration: 0.2, stagger: 0.12 },
              0.22,
            )
            .to(
              mediaElement,
              { y: 0, scale: 1, autoAlpha: 1, duration: 0.35 },
              0.58,
            );
          const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefreshInit: updateLength,
            onUpdate: ({ progress: p }) => {
              const scenes = steps.length + 2,
                start = desktop.matches ? 1 / scenes : 1 / (steps.length + 1),
                end = desktop.matches ? 1 - 1 / scenes : 1,
                cp = clamp((p - start) / (end - start)),
                index = Math.min(
                  steps.length - 1,
                  Math.floor(cp * steps.length),
                );
              setVideoProgress(cp);
              if (index !== activeIndex) activate(index, false, false);
            },
          });
          return () => {
            revealTl.kill();
            introTl.kill();
            trigger.kill();
            section.style.removeProperty("--decision-flow-length");
            setVideoProgress(0, true);
            activate(0, true, false);
          };
        },
      );
      media.add(
        "(max-width: 55.99rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const count = steps.length + 2;
          let scene = 0;
          const updateLength = () =>
            section.style.setProperty(
              "--decision-flow-length",
              `${Math.max(count * 80, Math.round(duration * 50))}svh`,
            );
          updateLength();
          gsap.set(progressBar, { scaleX: 0, transformOrigin: "0% 50%" });
          gsap.set(content, { y: 32, autoAlpha: 0 });
          const updateScene = (next: number) => {
            scene = Math.max(0, Math.min(count - 1, next));
            const isStepScene = scene > 0 && scene < count - 1;
            section.dataset.mobileScene =
              scene === 0
                ? "intro"
                : scene === count - 1
                  ? "evidence"
                  : "steps";
            const stepIndex = isStepScene ? scene - 1 : steps.length;
            if (scene > 0)
              activate(
                scene === count - 1 ? steps.length - 1 : scene - 1,
                false,
                false,
              );
            steps.forEach((step, i) => {
              let position = "offscreen";

              if (scene === count - 1 && i === steps.length - 1) {
                position = "previous";
              } else if (isStepScene) {
                if (i === stepIndex) position = "active";
                else if (i === stepIndex - 1) position = "previous";
                else if (i === stepIndex + 1) position = "next";
                else if (i < stepIndex) position = "before";
                else position = "after";
              } else if (scene === count - 1) {
                position = "before";
              }

              step.dataset.mobilePosition = position;
            });
            evidence.dataset.mobilePosition =
              scene === count - 1
                ? "active"
                : stepIndex === steps.length - 1
                  ? "next"
                  : "offscreen";
          };
          const introTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${innerHeight * 0.7}`,
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            })
            .to(header, { yPercent: -12, autoAlpha: 0, duration: 1 }, 0)
            .to(content, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.3);
          const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefreshInit: updateLength,
            onUpdate: ({ progress: p }) => {
              const scrub = clamp((p - 1 / count) / (1 - 2 / count)),
                next = Math.min(count - 1, Math.floor(p * count));
              setVideoProgress(scrub);
              gsap.set(progressBar, { scaleX: p });
              progress.setAttribute(
                "aria-valuenow",
                String(Math.round(p * 100)),
              );
              if (next !== scene) updateScene(next);
            },
          });
          const go = (target: number) =>
            window.scrollTo({
              top:
                trigger.start +
                (trigger.end - trigger.start) * ((target + 0.5) / count),
              behavior: "smooth",
            });
          const local: Array<[EventTarget, string, EventListener]> = [];
          steps.forEach((step, i) => {
            const button = step.querySelector("[data-decision-flow-trigger]");
            if (!button) return;
            const handler = () => {
              if (step.dataset.mobilePosition !== "active") go(i + 1);
            };
            button.addEventListener("click", handler);
            local.push([button, "click", handler]);
          });
          const evidenceHandler = () => go(count - 1);
          evidencePreview.addEventListener("click", evidenceHandler);
          local.push([evidencePreview, "click", evidenceHandler]);
          updateScene(0);
          return () => {
            local.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
            introTl.kill();
            trigger.kill();
            section.style.removeProperty("--decision-flow-length");
            delete section.dataset.mobileScene;
            progress.setAttribute("aria-valuenow", "0");
            setVideoProgress(0, true);
            activate(0, true, false);
          };
        },
      );
      cleanup(() => {
        cancelAnimationFrame(frame);
        video.pause();
        listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
        media.revert();
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="decision-flow"
      aria-labelledby="decision-flow-title"
      data-decision-flow
    >
      <div
        class="decision-flow__sticky"
        data-decision-flow-sticky="data-decision-flow-sticky"
      >
        <div class="decision-flow__panel">
          <div
            class="decision-flow__backdrop"
            aria-hidden="true"
            data-decision-flow-backdrop
          />
          <div class="decision-flow__header" data-decision-flow-header>
            <div class="decision-flow__heading">
              <p class="decision-flow__eyebrow" data-decision-flow-reveal>
                One decision, end-to-end
              </p>
              <h2
                id="decision-flow-title"
                class="decision-flow__title"
                data-decision-flow-reveal
              >
                From fourteen-thousand line-items to a decision you can still
                prove in 2031.
              </h2>
            </div>
            <p class="decision-flow__description" data-decision-flow-reveal>
              Illustrative. A €40m annual supplier re-award across 14,000 line
              items, with contract, quality, tooling and logistics data held in
              five systems.
            </p>
          </div>
          <div class="decision-flow__divider" data-decision-flow-divider />
          <div class="decision-flow__content" data-decision-flow-content>
            <div class="decision-flow__rail">
              <ol class="decision-flow__steps">
                {STEPS.map(([id, label, body], index) => (
                  <li
                    class="decision-flow__step"
                    data-state={index === 0 ? "active" : "inactive"}
                    data-decision-flow-step
                    data-decision-flow-reveal
                    key={id}
                  >
                    <button
                      class="decision-flow__trigger"
                      type="button"
                      aria-expanded={index === 0 ? "true" : "false"}
                      aria-controls={id}
                      data-decision-flow-trigger
                    >
                      <span class="decision-flow__summary">
                        <strong class="decision-flow__step-label">
                          {label}
                        </strong>
                        <span class="decision-flow__icon" aria-hidden="true">
                          <img
                            src="/assets/icons/plus-circle.svg"
                            alt=""
                            width={24}
                            height={24}
                          />
                        </span>
                      </span>
                    </button>
                    <div
                      class="decision-flow__step-details"
                      id={id}
                      aria-hidden={index === 0 ? "false" : "true"}
                      data-decision-flow-details
                    >
                      <div class="decision-flow__step-details-inner">
                        <p>{body}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div class="decision-flow__evidence" data-decision-flow-evidence>
                <button
                  class="decision-flow__evidence-preview"
                  type="button"
                  aria-label="View evidence slide"
                  data-decision-flow-evidence-preview
                >
                  <img
                    src="/assets/icons/arrow-circle-right.svg"
                    alt=""
                    width={38}
                    height={38}
                  />
                </button>
                <p
                  class="decision-flow__evidence-copy"
                  data-decision-flow-reveal
                >
                  Each step is an event. The decision is the event that binds
                  them.
                </p>
                <a
                  class="button button--inverse button--with-icon"
                  href="/how-it-works/"
                  data-decision-flow-reveal
                >
                  <span>View full cross-system evidence chain</span>
                  <span class="button__icon">
                    <img
                      src="/assets/icons/arrow-circle-dark.svg"
                      alt=""
                      width={38}
                      height={38}
                    />
                  </span>
                </a>
              </div>
            </div>
            <figure class="decision-flow__media" data-decision-flow-media>
              <video
                class="decision-flow__video"
                muted
                playsInline
                preload="none"
                poster="/assets/images/identify-new.png"
                role="img"
                aria-label="Animated decision flow moving through identification, understanding, decision, action, and proof."
                data-decision-flow-video
              >
                <source
                  src="/assets/video/Veriy-120fps-2.webm"
                  type="video/webm"
                  data-decision-flow-video-webm
                />
                <source
                  src="/assets/video/Verity-120fps-2.mov"
                  type="video/quicktime; codecs=hvc1"
                  data-decision-flow-video-mov
                />
              </video>
            </figure>
          </div>
          <div
            class="decision-flow__mobile-progress"
            role="progressbar"
            aria-label="Decision flow progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            data-decision-flow-progress
          >
            <span class="decision-flow__mobile-progress-track">
              <span
                class="decision-flow__mobile-progress-bar"
                data-decision-flow-progress-bar
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});
