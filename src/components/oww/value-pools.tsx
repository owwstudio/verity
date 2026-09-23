import {
  component$,
  Slot,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import valuePoolsCss from "./value-pools.css?inline";

/**
 * OWW value-pools section.
 *
 * Markup ported from code/handoff/sections/value-pools/value-pools.html,
 * behaviour from value-pools.js. data-* and ARIA attributes preserved verbatim.
 *
 * Overlap composition: the <Slot/> below sits exactly where the vendor's
 * reference code/index.html places <section class="industry-pools">, i.e.
 * inside .value-pools__overlap-stage, after .value-pools__table-runway. That
 * nesting is what produces the effect readme.md section 5 describes — the table
 * pins while industry-pools slides over it — because .value-pools__table-screen
 * is position:sticky within .value-pools__overlap-stage and .industry-pools
 * carries z-index:3 over an opaque background.
 *
 * The readme's own snippet instead puts both sections side by side in a
 * <div class="value-pools-stage-wrapper">. That class has no rule in any
 * stylesheet in the package, so it would leave the two sections sequential
 * rather than overlapping. The shipped reference is followed instead.
 *
 * The seven rows are held as data rather than repeated markup so copy edits are
 * a one-line change. Strings are otherwise verbatim from the vendor HTML, with
 * one deliberate change: the product name reads V, not Verity.
 *
 * CEO instructions 2026-09-16, in order: "Until the Verity situation with
 * Veritas is cleared, replace Verity with HH on the page", then "Replace HH in
 * the text of the website by V". A holding position on an unresolved trademark
 * question, not a rename — see design/brand-naming.md.
 *
 * Row content was reconciled against the CEO's reference table on 2026-09-16.
 * Four rows differed and are corrected here:
 *
 *   2 Decision capital   unlocks text was truncated to "Authority reusable and
 *                        machine-executable"
 *   4 Prevented loss     unlocks read "Stop Errors, Blocks unauthorised
 *                        actions"; the measures omitted warranty cost
 *   7 Capital and        the measures column was a verbatim copy of row 6's,
 *     platform           so two rows claimed the same metrics
 *
 * Also normalised: the vendor's singular "What V Unlock" on row 1 now reads
 * "Unlocks" like the other six, and the trailing full stops on rows 3 and 4 are
 * gone, since no other row carried them.
 *
 * The reference table spells row 4 "leackage". That is a typo in the source and
 * is NOT reproduced — the row reads "leakage" here.
 */

/*
  Row icons for the Value pool (outcome) and What it unlocks (mechanism) columns,
  CEO 2026-09-16. The ruler in the third column applies to every row and is not
  listed. AI investment yield is handled in the markup because its first icon is
  a composite. Noun Project: 6614860 "knowledge capital", 2253010 "development
  policies".
*/
const ROW_ICONS: Record<string, { value?: string; unlocks?: string }> = {
  "value-pool-decision-capital": {
    value: "/assets/icons/knowledge-capital.svg",
    unlocks: "/assets/icons/development-policies.svg",
  },
  // Noun Project 7063099 "human robot interaction". The value icon is a gauge
  // pair rendered in the markup.
  "value-pool-operational-capacity": {
    unlocks: "/assets/icons/human-robot-interaction.svg",
  },
  // Noun Project 399376 "money shield", 5630143 "stop sign hand".
  "value-pool-prevented-loss": {
    value: "/assets/icons/money-shield.svg",
    unlocks: "/assets/icons/stop-sign-hand.svg",
  },
  // Noun Project 67670 "investment", 8369846 "predictive maintenance".
  "value-pool-asset-service": {
    value: "/assets/icons/investment.svg",
    unlocks: "/assets/icons/predictive-maintenance.svg",
  },
  // Noun Project 7602897 "assurance", 6430955 "Retrospective".
  "value-pool-assurance": {
    value: "/assets/icons/assurance.svg",
    unlocks: "/assets/icons/retrospective.svg",
  },
  // Noun Project 8357194 "online productivity", 2688380 "accelerate".
  "value-pool-capital-platform": {
    value: "/assets/icons/online-productivity.svg",
    unlocks: "/assets/icons/accelerate.svg",
  },
};

// Visible column label per detail cell, shown only in the stacked tablet layout
// where the column headings are hidden. Wording follows the column headings.
const COLUMN_LABELS: Record<string, string> = {
  "Value Captured": "Value pool",
  "What Helge Heupel Unlocks": "What Helge Heupel unlocks",
  "How you measure it": "How you measure it",
};

type Row = {
  id: string;
  heading: string;
  state: "expanded" | "collapsed";
  details: Array<[string, string]>;
};

const ROWS: Row[] = [
  {
    id: "value-pool-ai-investment",
    heading: "AI investment yield",
    state: "expanded",
    details: [
      ["Value Captured", "AI investment yield and value realisation"],
      [
        "What Helge Heupel Unlocks",
        "Proven models, agents and automation move from pilot into governed production",
      ],
      [
        "How you measure it",
        "Production conversion, realised ROI, time to value",
      ],
    ],
  },
  {
    id: "value-pool-decision-capital",
    heading: "Decision capital",
    state: "collapsed",
    details: [
      ["Value Captured", "Decision capital and decision productivity"],
      [
        "What Helge Heupel Unlocks",
        "Makes organisational knowledge, semantics, policies and authority reusable and machine-executable",
      ],
      [
        "How you measure it",
        "Decision time, rework, escalations, key-person dependency",
      ],
    ],
  },
  {
    id: "value-pool-operational-capacity",
    heading: "Operational capacity",
    state: "collapsed",
    details: [
      ["Value Captured", "Increase operational capacity and productivity"],
      [
        "What Helge Heupel Unlocks",
        "Automates permitted decisions while people retain intent, exceptions, and judgement",
      ],
      [
        "How you measure it",
        "Backlog, cycle time, cost per decision, capacity released",
      ],
    ],
  },
  {
    id: "value-pool-prevented-loss",
    heading: "Prevented loss and leakage",
    state: "collapsed",
    details: [
      [
        "Value Captured",
        "Reduce financial, operational and reputational losses",
      ],
      [
        "What Helge Heupel Unlocks",
        "Stops errors, fraud, warranty leakage, and unauthorised actions before execution",
      ],
      [
        "How you measure it",
        "Loss ratio, fraud loss, warranty cost, incident cost",
      ],
    ],
  },
  {
    id: "value-pool-asset-service",
    heading: "Asset and service value",
    state: "collapsed",
    details: [
      ["Value Captured", "Asset productivity and service value"],
      [
        "What Helge Heupel Unlocks",
        "Converts connected-asset signals into authorised maintenance, software, and service actions",
      ],
      ["How you measure it", "Uptime, downtime, service revenue, retention"],
    ],
  },
  {
    id: "value-pool-assurance",
    heading: "Assurance economics",
    state: "collapsed",
    details: [
      ["Value Captured", "Assurance economics and efficiency"],
      [
        "What Helge Heupel Unlocks",
        "Replaces retrospective evidence collection with continuous, independently verifiable evidence",
      ],
      [
        "How you measure it",
        "Audit effort, control coverage, remediation time, assurance margin",
      ],
    ],
  },
  {
    id: "value-pool-capital-platform",
    heading: "Capital and platform productivity",
    state: "collapsed",
    details: [
      ["Value Captured", "Capital and platform productivity"],
      [
        "What Helge Heupel Unlocks",
        "Accelerates claims, collections, and approvals while reusing existing cloud, data, and control investments",
      ],
      [
        "How you measure it",
        "Claims/collections/approval time, platform reuse rate, cost per transaction",
      ],
    ],
  },
];

export const ValuePools = component$(() => {
  useStyles$(valuePoolsCss);

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
        title: "[data-value-pools-title]",
        tableScreen: "[data-value-pools-table-screen]",
        tableContent: "[data-value-pools-content]",
        tableScroll: "[data-value-pools-table-scroll]",
        tableRunway: "[data-value-pools-table-runway]",
        tableHead: "[data-value-pools-table-head]",
        row: "[data-value-pools-row]",
        rowTrigger: "[data-value-pools-row-trigger]",
        rowCollapse: "[data-value-pools-row-collapse]",
        rowDetails: "[data-value-pools-row-details]",
      };

      const listeners: Array<{
        el: EventTarget;
        type: string;
        fn: EventListener;
      }> = [];
      const timers: number[] = [];
      const on = (el: EventTarget, type: string, fn: EventListener) => {
        el.addEventListener(type, fn);
        listeners.push({ el, type, fn });
      };

      // Scoped to sectionRef — readme section 6.2.
      const title = section.querySelector<HTMLElement>(SELECTORS.title);
      const tableScreen = section.querySelector<HTMLElement>(
        SELECTORS.tableScreen,
      );
      const tableContent = section.querySelector<HTMLElement>(
        SELECTORS.tableContent,
      );
      const tableScroll = section.querySelector<HTMLElement>(
        SELECTORS.tableScroll,
      );
      const tableRunway = section.querySelector<HTMLElement>(
        SELECTORS.tableRunway,
      );
      const tableHead = section.querySelector<HTMLElement>(SELECTORS.tableHead);
      const rows = gsap.utils.toArray<HTMLElement>(SELECTORS.row, section);

      if (
        !title ||
        !tableScreen ||
        !tableContent ||
        !tableScroll ||
        !tableRunway ||
        !tableHead ||
        !rows.length
      )
        return;

      // The pinned table's scroll distance is computed from tableScroll.scrollHeight
      // once at setup and again on refresh. Opening or closing a row changes that
      // height, and until 2026-09-16 that could not happen after setup: exactly one
      // row was always expanded. The collapse control added that day can leave every
      // row closed, which shrinks the content well below the figure the pin was
      // measured against and leaves an empty stretch of scroll.
      //
      // Any state change now schedules a refresh. Debounced, because expansion also
      // fires on pointerenter and a refresh per hover would be wasteful.
      // Scoped deliberately. ScrollTrigger.refresh() with no argument refreshes
      // EVERY trigger on the page, including the-problem's pinned 1050svh timeline
      // and decision-flow's 700svh one. Firing that from a hover, mid-scroll, resets
      // pins that are in the middle of a scrub and leaves sections showing nothing
      // but their background gradient. Only the table's own trigger is refreshed.
      let refreshTable: (() => void) | null = null;
      let refreshTimer = 0;
      const scheduleRefresh = () => {
        if (!refreshTable) return;
        window.clearTimeout(refreshTimer);
        // 560ms: after the 500ms row height transition, so the measurement is final.
        refreshTimer = window.setTimeout(() => refreshTable?.(), 560);
        timers.push(refreshTimer);
      };

      const setRowExpanded = (row: HTMLElement, expanded: boolean) => {
        const trigger = row.querySelector(SELECTORS.rowTrigger);
        const details = row.querySelector(SELECTORS.rowDetails);
        if (row.dataset.state === (expanded ? "expanded" : "collapsed")) return;
        row.dataset.state = expanded ? "expanded" : "collapsed";
        trigger?.setAttribute("aria-expanded", String(expanded));
        details?.setAttribute("aria-hidden", String(!expanded));
        scheduleRefresh();
      };

      const hoverQuery = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );
      const initialRow =
        rows.find((row) => row.dataset.state === "expanded") ?? rows[0];
      const expandRow = (targetRow: HTMLElement) => {
        rows.forEach((row) => setRowExpanded(row, row === targetRow));
      };
      expandRow(initialRow);

      rows.forEach((row) => {
        const trigger = row.querySelector<HTMLElement>(SELECTORS.rowTrigger);
        if (!trigger) return;
        // A row the visitor has deliberately collapsed must not spring open again
        // the moment the pointer moves inside it, which is what made the caret
        // look dead on a hover device. The flag clears when the pointer leaves.
        on(row, "pointerenter", (() => {
          if (hoverQuery.matches && !row.dataset.userCollapsed) expandRow(row);
        }) as EventListener);
        on(row, "pointerleave", (() => {
          delete row.dataset.userCollapsed;
        }) as EventListener);

        const collapse = row.querySelector<HTMLElement>(SELECTORS.rowCollapse);
        if (collapse) {
          on(collapse, "click", ((event: Event) => {
            event.stopPropagation();
            row.dataset.userCollapsed = "true";
            setRowExpanded(row, false);
            trigger.focus();
          }) as EventListener);
        }
        on(trigger, "focus", (() => expandRow(row)) as EventListener);
        on(trigger, "click", (() => expandRow(row)) as EventListener);
        on(trigger, "keydown", ((event: KeyboardEvent) => {
          if (event.key !== "Escape") return;
          expandRow(initialRow);
          initialRow.querySelector<HTMLElement>(SELECTORS.rowTrigger)?.focus();
        }) as EventListener);
      });

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const titleReveal = gsap.fromTo(
          title,
          { y: 48, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: title,
              start: "top 92%",
              end: "center 52%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );

        const titleOverlap = gsap.to(title, {
          scale: 0.82,
          color: "#858585",
          transformOrigin: "center center",
          ease: "none",
          scrollTrigger: {
            trigger: tableScreen,
            start: "top bottom",
            end: "top 48%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        const tableReveal = gsap.timeline({
          scrollTrigger: {
            trigger: tableScreen,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
        tableReveal
          .fromTo(
            tableHead,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
          )
          .fromTo(
            rows,
            { y: 28, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              stagger: 0.11,
              ease: "power3.out",
            },
            "-=0.12",
          );

        return () => {
          titleReveal.scrollTrigger?.kill();
          titleOverlap.scrollTrigger?.kill();
          tableReveal.scrollTrigger?.kill();
          titleReveal.kill();
          titleOverlap.kill();
          tableReveal.kill();
        };
      });

      media.add(
        "(min-width: 70rem) and (prefers-reduced-motion: no-preference)",
        () => {
          const desktopMedia = window.matchMedia("(min-width: 70rem)");
          const desktopMinimumRunway = 1.25;
          const desktopTravelMultiplier = 2;
          let tableTravel = 0;
          let tableScrollDistance = 1;
          const updateTableTravel = () => {
            const contentStyles = window.getComputedStyle(tableContent);
            const padding =
              Number.parseFloat(contentStyles.paddingBlockStart) +
              Number.parseFloat(contentStyles.paddingBlockEnd);
            const requiredHeight = tableScroll.scrollHeight + padding;
            tableTravel = Math.max(
              0,
              requiredHeight - tableScreen.clientHeight + 24,
            );
            tableScrollDistance = desktopMedia.matches
              ? Math.max(
                  tableTravel * desktopTravelMultiplier,
                  tableScreen.clientHeight * desktopMinimumRunway,
                )
              : Math.max(tableTravel, 1);
            tableRunway.style.blockSize = `${tableScrollDistance}px`;
          };
          updateTableTravel();

          const tablePan = gsap.to(tableScroll, {
            y: () => -tableTravel,
            ease: "none",
            scrollTrigger: {
              // The stage, not the screen. The screen is position:sticky, so a refresh
              // while it is stuck measures its stuck position and shifts the pan range.
              trigger: tableScreen.parentElement ?? tableScreen,
              start: "top top",
              end: () => `+=${tableScrollDistance}`,
              scrub: 0.7,
              invalidateOnRefresh: true,
              onRefreshInit: updateTableTravel,
            },
          });

          // A row change resizes the runway, which moves everything below the table.
          // Those triggers (industry-pools, decision-flow) are refreshed too, in
          // page order; triggers above the table are left alone.
          refreshTable = () => {
            updateTableTravel();
            tablePan.scrollTrigger?.refresh();
            ScrollTrigger.getAll()
              .filter(
                (st) =>
                  st !== tablePan.scrollTrigger &&
                  st.trigger instanceof Element &&
                  !tableScreen.contains(st.trigger) &&
                  tableScreen.compareDocumentPosition(st.trigger) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
              )
              .forEach((st) => st.refresh());
          };

          return () => {
            refreshTable = null;
            window.clearTimeout(refreshTimer);
            tablePan.scrollTrigger?.kill();
            tablePan.kill();
            tableRunway.style.removeProperty("block-size");
            gsap.set(tableScroll, { clearProps: "transform" });
          };
        },
      );

      cleanup(() => {
        listeners.forEach(({ el, type, fn }) =>
          el.removeEventListener(type, fn),
        );
        timers.forEach((t) => window.clearTimeout(t));
        media.revert();
      });
    },
    { strategy: "document-ready" },
  );

  return (
    <section
      ref={sectionRef}
      class="value-pools"
      aria-labelledby="value-pools-title"
      data-value-pools="data-value-pools"
    >
      <div
        class="value-pools__intro"
        data-value-pools-intro="data-value-pools-intro"
      >
        <div class="value-pools__intro-inner container">
          <h2
            class="value-pools__title"
            id="value-pools-title"
            data-value-pools-title="data-value-pools-title"
          >
            {/* Line break after "ready", CEO 2026-09-17. */}
            Seven places where value is ready
            <br />
            to be unlocked.
          </h2>
        </div>
      </div>
      <div class="value-pools__overlap-stage">
        <div
          class="value-pools__table-screen"
          data-value-pools-table-screen="data-value-pools-table-screen"
        >
          <div
            class="value-pools__content container"
            data-value-pools-content="data-value-pools-content"
          >
            <div
              class="value-pools__table-scroll"
              role="region"
              aria-label="Helge Heupel value pools"
              tabIndex={0}
              data-value-pools-table-scroll="data-value-pools-table-scroll"
            >
              <div
                class="value-pools__table"
                data-value-pools-table="data-value-pools-table"
              >
                <div
                  class="value-pools__table-head"
                  aria-hidden="true"
                  data-value-pools-table-head="data-value-pools-table-head"
                >
                  <span class="value-pools__category-heading"></span>
                  <span class="value-pools__column-heading">
                    <strong class="value-pools__column-title">
                      Value pool
                    </strong>
                  </span>
                  <span class="value-pools__column-heading">
                    <strong class="value-pools__column-title">
                      What Helge Heupel unlocks
                    </strong>
                  </span>
                  <span class="value-pools__column-heading">
                    <strong class="value-pools__column-title">
                      How you measure it
                    </strong>
                  </span>
                </div>
                <div class="value-pools__table-body">
                  {ROWS.map((row) => (
                    <article
                      key={row.id}
                      class="value-pools__row"
                      data-state={row.state}
                      data-value-pools-row="data-value-pools-row"
                    >
                      <button
                        class="value-pools__row-trigger"
                        type="button"
                        aria-expanded={
                          row.state === "expanded" ? "true" : "false"
                        }
                        aria-controls={row.id}
                        data-value-pools-row-trigger="data-value-pools-row-trigger"
                      >
                        <span class="value-pools__row-heading">
                          {row.heading}
                        </span>
                        {/* One indicator for each of the three table columns. */}
                        {row.details.map(([label]) => (
                          <span class="value-pools__value" key={label}>
                            <img
                              class="value-pools__dot"
                              src="/assets/icons/value-pool-dot.svg"
                              alt=""
                              width="10"
                              height="10"
                              aria-hidden="true"
                            />
                          </span>
                        ))}
                        <span
                          class="value-pools__trigger-caret"
                          aria-hidden="true"
                        >
                          <img
                            src="/assets/icons/caret-down.svg"
                            alt=""
                            width="16"
                            height="16"
                          />
                        </span>
                      </button>
                      <div
                        class="value-pools__row-details"
                        id={row.id}
                        aria-hidden={
                          row.state === "expanded" ? "false" : "true"
                        }
                        data-value-pools-row-details="data-value-pools-row-details"
                      >
                        <div class="value-pools__row-details-inner">
                          {row.details.map(([label, text]) => (
                            <div
                              class="value-pools__detail"
                              key={label}
                              aria-label={label}
                            >
                              <div class="value-pools__detail-heading">
                                {/*
                                Ruler above the measures, CEO 2026-09-16. Decorative:
                                the cell's aria-label already names the column.
                                Icon: Noun Project 8275767 "Ruler".
                              */}
                                {/*
                                AI investment yield, CEO 2026-09-16: the yield mark with the
                                AI stars set smaller at its top-right, read as one icon.
                                Icons: Noun Project 7115155 "yield", 8478371 "AI".
                              */}
                                {row.id === "value-pool-ai-investment" &&
                                  label === "Value Captured" && (
                                    <span
                                      class="value-pools__detail-icon value-pools__detail-icon--composite"
                                      aria-hidden="true"
                                    >
                                      <img
                                        class="value-pools__detail-icon-main"
                                        src="/assets/icons/yield.svg"
                                        alt=""
                                        width="24"
                                        height="24"
                                      />
                                      <img
                                        class="value-pools__detail-icon-badge"
                                        src="/assets/icons/ai-stars.svg"
                                        alt=""
                                        width="14"
                                        height="14"
                                      />
                                    </span>
                                  )}
                                {/* Middle column of the AI investment yield row, CEO 2026-09-16.
                                  Icon: Noun Project 8201952 "Overall Equipment Effectiveness". */}
                                {row.id === "value-pool-ai-investment" &&
                                  label === "What Helge Heupel Unlocks" && (
                                    <img
                                      class="value-pools__detail-icon value-pools__detail-icon--oee"
                                      src="/assets/icons/oee.svg"
                                      alt=""
                                      width="34"
                                      height="34"
                                      aria-hidden="true"
                                    />
                                  )}
                                {/*
                                Operational capacity, CEO 2026-09-17: one gauge with two
                                needles, replacing a side-by-side pair that did not fit the
                                stacked tablet layout. The dimmed needle is the original
                                reading, the full-strength one sits on the dial's last tick.
                                Icon: Noun Project 5785769 "Speedometer", needles edited.
                              */}
                                {row.id === "value-pool-operational-capacity" &&
                                  label === "Value Captured" && (
                                    <img
                                      class="value-pools__detail-icon value-pools__detail-icon--gauge"
                                      src="/assets/icons/speedometer-max.svg"
                                      alt=""
                                      width="34"
                                      height="34"
                                      aria-hidden="true"
                                    />
                                  )}
                                {label === "Value Captured" &&
                                  ROW_ICONS[row.id]?.value && (
                                    <img
                                      class="value-pools__detail-icon"
                                      src={ROW_ICONS[row.id].value}
                                      alt=""
                                      width="34"
                                      height="34"
                                      aria-hidden="true"
                                    />
                                  )}
                                {label === "What Helge Heupel Unlocks" &&
                                  ROW_ICONS[row.id]?.unlocks && (
                                    <img
                                      class="value-pools__detail-icon"
                                      src={ROW_ICONS[row.id].unlocks}
                                      alt=""
                                      width="34"
                                      height="34"
                                      aria-hidden="true"
                                    />
                                  )}
                                {label === "How you measure it" && (
                                  <img
                                    class="value-pools__detail-icon"
                                    src="/assets/icons/ruler.svg"
                                    alt=""
                                    width="24"
                                    height="24"
                                    aria-hidden="true"
                                  />
                                )}
                                <strong>{COLUMN_LABELS[label]}</strong>
                              </div>
                              <p class="value-pools__detail-text">{text}</p>
                            </div>
                          ))}
                          <button
                            class="value-pools__caret-control"
                            type="button"
                            aria-label={`Collapse ${row.heading}`}
                            aria-controls={row.id}
                            data-value-pools-row-collapse="data-value-pools-row-collapse"
                          >
                            <img
                              class="value-pools__caret"
                              src="/assets/icons/caret-down.svg"
                              alt=""
                              width="16"
                              height="16"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="value-pools__table-runway"
          aria-hidden="true"
          data-value-pools-table-runway="data-value-pools-table-runway"
        ></div>
        {/* industry-pools is composed in here — see the component comment. */}
        <Slot />
      </div>
    </section>
  );
});
