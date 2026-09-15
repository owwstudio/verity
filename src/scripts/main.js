import './core/lenis.js'
import { initDecisionFlow } from './sections/decision-flow.js'
import { initIndustryPools } from './sections/industry-pools.js'
import { initTheProblem } from './sections/the-problem.js'
import { initValuePools } from './sections/value-pools.js'

initTheProblem()
initValuePools()
initIndustryPools()
initDecisionFlow()
