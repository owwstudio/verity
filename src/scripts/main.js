import './core/lenis.js'
import { initAuthorityEvidence } from './sections/authority-evidence.js'
import { initNavbar } from './components/navbar.js'
import { initDecisionFlow } from './sections/decision-flow.js'
import { initIndustryPools } from './sections/industry-pools.js'
import { initOwnedStack } from './sections/owned-stack.js'
import { initSiteFooter } from './sections/site-footer.js'
import { initStatusStack } from './sections/status-stack.js'
import { initTenToOne } from './sections/ten-to-one.js'
import { initTheProblem } from './sections/the-problem.js'
import { initValuePools } from './sections/value-pools.js'
import { initVerityStory } from './sections/verity-story.js'

initNavbar()
initAuthorityEvidence()
initTheProblem()
initValuePools()
initIndustryPools()
initDecisionFlow()
initOwnedStack()
initTenToOne()
initVerityStory()
initStatusStack()
initSiteFooter()
