import { PRICING_DATA } from './pricingData';

/**
 * Analyzes Cursor spending and returns recommendations
 */
function analyzeCursor(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // Business plan with ≤2 seats → recommend Pro
  if (plan === 'business' && seats <= 2) {
    const proPrice = toolData.plans.pro.price;
    const businessPrice = toolData.plans.business.price;
    const monthlySavings = (businessPrice - proPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Switch to Pro plan',
      recommendedPlan: toolData.plans.pro.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Business adds admin controls unnecessary for teams under 3. Pro has identical AI features at $${proPrice}/seat saving $${monthlySavings}/month`,
      status: 'save',
    };
  }

  // Writing or data use case → consider Claude Pro
  if ((useCase === 'writing' || useCase === 'data') && !['enterprise'].includes(plan)) {
    return {
      ...base,
      recommendedAction: 'Consider Claude Pro instead',
      recommendedPlan: 'Claude Pro',
      monthlySavings: 0,
      reason: 'Cursor is optimized for coding. Claude Pro at $20/month covers writing and data tasks without per-seat pricing',
      status: 'consider',
    };
  }

  return base;
}

/**
 * Analyzes GitHub Copilot spending and returns recommendations
 */
function analyzeGitHubCopilot(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // Business plan with ≤2 seats → recommend Individual
  if (plan === 'business' && seats <= 2) {
    const businessPrice = toolData.plans.business.price;
    const individualPrice = toolData.plans.individual.price;
    const monthlySavings = (businessPrice - individualPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Switch to Individual plan',
      recommendedPlan: toolData.plans.individual.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Business plan policy controls add no value for teams under 3. Individual plan has identical code completion at $${individualPrice}/seat saving $${monthlySavings}/month`,
      status: 'save',
    };
  }

  // Enterprise with < 10 seats → recommend Business
  if (plan === 'enterprise' && seats < 10) {
    const businessPrice = toolData.plans.business.price;
    const monthlySavings = businessPrice * seats; // Estimate for enterprise
    
    return {
      ...base,
      recommendedAction: 'Downgrade to Business plan',
      recommendedPlan: toolData.plans.business.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Enterprise features (audit logs, SCIM) are only valuable at 10+ seats. Business plan at $${businessPrice}/seat provides identical code completion`,
      status: 'save',
    };
  }

  return base;
}

/**
 * Analyzes Claude spending and returns recommendations
 */
function analyzeClaude(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // Team plan with ≤2 seats → recommend Pro
  if (plan === 'team' && seats <= 2) {
    const teamPrice = toolData.plans.team.price;
    const proPrice = toolData.plans.pro.price;
    const monthlySavings = (teamPrice - proPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Switch to Pro plan',
      recommendedPlan: toolData.plans.pro.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Team plan requires minimum 5 users to justify admin features. ${seats} users on Pro saves $${monthlySavings}/month with identical capabilities`,
      status: 'save',
    };
  }

  // Max plan but not coding/research → recommend Pro
  if (plan === 'max' && useCase !== 'coding' && useCase !== 'research') {
    const maxPrice = toolData.plans.max.price;
    const proPrice = toolData.plans.pro.price;
    const monthlySavings = (maxPrice - proPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Downgrade to Pro plan',
      recommendedPlan: toolData.plans.pro.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Max plan's extended context is primarily valuable for large codebase analysis. Pro plan handles ${useCase} tasks at $${proPrice}/month saving $${monthlySavings}/month`,
      status: 'save',
    };
  }

  return base;
}

/**
 * Analyzes ChatGPT spending and returns recommendations
 */
function analyzeChatGPT(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // Team plan with ≤2 seats → recommend Plus
  if (plan === 'team' && seats <= 2) {
    const teamPrice = toolData.plans.team.price;
    const plusPrice = toolData.plans.plus.price;
    const monthlySavings = (teamPrice - plusPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Switch to Plus plan',
      recommendedPlan: toolData.plans.plus.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Team adds collaboration features that only matter at 3+ users. Plus at $${plusPrice}/month has same GPT-4 access saving $${monthlySavings}/month`,
      status: 'save',
    };
  }

  // Coding use case → suggest Cursor or Copilot
  if (useCase === 'coding' && plan !== 'pro') {
    return {
      ...base,
      recommendedAction: 'Consider Cursor Pro instead',
      recommendedPlan: 'Cursor Pro',
      monthlySavings: 0,
      reason: 'ChatGPT lacks inline IDE integration. Cursor Pro at $20/month provides same AI capability with direct code editor integration',
      status: 'consider',
    };
  }

  return base;
}

/**
 * Analyzes API spending and returns recommendations
 */
function analyzeAPI(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  
  const base = {
    tool: toolData.name,
    currentPlan: 'Pay-per-token',
    currentSpend: monthlySpend,
    recommendedAction: 'No plan switching available',
    recommendedPlan: 'Pay-per-token',
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'API pricing is usage-based',
    status: 'optimal',
  };

  // High spend → flag for Credex
  if (monthlySpend > 200) {
    return {
      ...base,
      recommendedAction: 'Consider Credex bulk credits',
      monthlySavings: monthlySpend * 0.25, // Estimate 20-30% savings
      annualSavings: monthlySpend * 0.25 * 12,
      reason: `At $${monthlySpend}/month API spend, Credex credits could reduce this by 20-30% through bulk infrastructure pricing`,
      status: 'consider',
    };
  }

  return base;
}

/**
 * Analyzes Gemini spending and returns recommendations
 */
function analyzeGemini(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // AI Pro for coding → suggest Copilot
  if (useCase === 'coding' && plan === 'aiPro') {
    return {
      ...base,
      recommendedAction: 'Consider GitHub Copilot Individual instead',
      recommendedPlan: 'GitHub Copilot Individual',
      monthlySavings: 0,
      reason: 'Gemini lacks IDE integration for coding workflows. GitHub Copilot Individual at $10/month provides inline suggestions in VS Code',
      status: 'consider',
    };
  }

  return base;
}

/**
 * Analyzes Windsurf spending and returns recommendations
 */
function analyzeWindsurf(toolKey, plan, seats, monthlySpend, useCase) {
  const toolData = PRICING_DATA[toolKey];
  const currentPlanData = toolData.plans[plan];
  
  const base = {
    tool: toolData.name,
    currentPlan: currentPlanData.label,
    currentSpend: monthlySpend,
    recommendedAction: 'Keep current plan',
    recommendedPlan: currentPlanData.label,
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'This plan is well-matched to your team size and use case',
    status: 'optimal',
  };

  // Teams plan with ≤2 seats → recommend Pro
  if (plan === 'teams' && seats <= 2) {
    const teamsPrice = toolData.plans.teams.price;
    const proPrice = toolData.plans.pro.price;
    const monthlySavings = (teamsPrice - proPrice) * seats;
    
    return {
      ...base,
      recommendedAction: 'Switch to Pro plan',
      recommendedPlan: toolData.plans.pro.label,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      reason: `Teams plan admin features are unnecessary under 3 seats. Pro at $${proPrice}/seat saves $${monthlySavings}/month`,
      status: 'save',
    };
  }

  return base;
}

/**
 * Route to the appropriate analyzer based on tool
 */
function analyzeTool(toolKey, plan, seats, monthlySpend, useCase) {
  const analyzers = {
    cursor: analyzeCursor,
    'github-copilot': analyzeGitHubCopilot,
    claude: analyzeClaude,
    chatgpt: analyzeChatGPT,
    'anthropic-api': analyzeAPI,
    'openai-api': analyzeAPI,
    gemini: analyzeGemini,
    windsurf: analyzeWindsurf,
  };

  const analyzer = analyzers[toolKey];
  if (!analyzer) {
    console.warn(`No analyzer found for tool: ${toolKey}`);
    return null;
  }

  return analyzer(toolKey, plan, seats, monthlySpend, useCase);
}

/**
 * Main audit function
 * Takes formData and returns audit recommendations
 */
export function runAudit(formData) {
  const { teamSize, useCase, tools } = formData;

  const recommendations = [];
  let totalCurrentSpend = 0;
  let totalMonthlySavings = 0;

  // Analyze each tool
  for (const toolEntry of tools) {
    if (!toolEntry.tool) continue;

    const recommendation = analyzeTool(
      toolEntry.tool,
      toolEntry.plan,
      toolEntry.seats,
      toolEntry.monthlySpend,
      useCase
    );

    if (recommendation) {
      recommendations.push(recommendation);
      totalCurrentSpend += recommendation.currentSpend;
      totalMonthlySavings += recommendation.monthlySavings;
    }
  }

  const totalAnnualSavings = totalMonthlySavings * 12;
  const isOptimal = totalMonthlySavings < 100;

  return {
    recommendations,
    totalCurrentSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
  };
}
