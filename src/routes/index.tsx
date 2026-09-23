import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Hero } from "~/components/oww/hero";
import { TheProblem } from "~/components/oww/the-problem";
import { ValuePools } from "~/components/oww/value-pools";
import { IndustryPools } from "~/components/oww/industry-pools";
import { DecisionFlow } from "~/components/oww/decision-flow";
import { OwnedStack } from "~/components/oww/owned-stack";
import { TenToOne } from "~/components/oww/ten-to-one";
import { AuthorityEvidence } from "~/components/oww/authority-evidence";
import { VerityStory } from "~/components/oww/verity-story";
import { StatusStack } from "~/components/oww/status-stack";

/**
 * Home page — One Week Wonders (OWW) design.
 *
 * The previous design's components remain on disk under src/components/ but are
 * no longer composed here.
 *
 * The navbar lives in src/routes/layout.tsx (site-wide), inside the
 * .navbar-shell wrapper the vendor's reference index.html uses.
 *
 * IndustryPools is passed as a child of ValuePools so that it renders inside
 * .value-pools__overlap-stage. That is the single wrapper the overlap needs:
 * the value-pools table pins while industry-pools slides over it. See the
 * component comment in value-pools.tsx for why this differs from the readme's
 * illustrative snippet.
 */
export default component$(() => {
  return (
    <>
      <Hero />
      <TheProblem />
      <ValuePools>
        <IndustryPools />
      </ValuePools>
      <DecisionFlow />
      <OwnedStack />
      <TenToOne />
      <AuthorityEvidence />
      <VerityStory />
      <StatusStack />
    </>
  );
});

export const head: DocumentHead = {
  title: "Helge Heupel",
  meta: [
    {
      name: "description",
      content: "Enterprise Decision Infrastructure.",
    },
  ],
};
