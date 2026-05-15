export const PRICING_DATA = {
  cursor: {
    name: 'Cursor',
    plans: {
      hobby: { price: 0, label: 'Hobby' },
      pro: { price: 20, label: 'Pro' },
      proPlus: { price: 60, label: 'Pro+' },
      business: { price: 40, label: 'Business' },
      ultra: { price: 200, label: 'Ultra' },
      teams: { price: 40, label: 'Teams' },
      enterprise: { price: 'contact', label: 'Enterprise' },
    }
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    plans: {
      free: { price: 0, label: 'Free' },
      individual: { price: 10, label: 'Individual' },
      business: { price: 19, label: 'Business' },
      enterprise: { price: 39, label: 'Enterprise' },
    }
  },
  claude: {
    name: 'Claude',
    plans: {
      free: { price: 0, label: 'Free' },
      pro: { price: 20, label: 'Pro' },
      max: { price: 100, label: 'Max' },
      team: { price: 30, label: 'Team' },
      enterprise: { price: 'contact', label: 'Enterprise' },
    }
  },
  chatgpt: {
    name: 'ChatGPT',
    plans: {
      free: { price: 0, label: 'Free' },
      plus: { price: 20, label: 'Plus' },
      pro: { price: 200, label: 'Pro' },
      team: { price: 30, label: 'Team' },
      business: { price: 30, label: 'Business' },
      enterprise: { price: 'contact', label: 'Enterprise' },
    }
  },
  'anthropic-api': {
    name: 'Anthropic API',
    api_based: true,
    plans: {
      payAsYouGo: { price: 0, label: 'Pay-per-token' },
    }
  },
  'openai-api': {
    name: 'OpenAI API',
    api_based: true,
    plans: {
      payAsYouGo: { price: 0, label: 'Pay-per-token' },
    }
  },
  gemini: {
    name: 'Gemini',
    plans: {
      free: { price: 0, label: 'Free' },
      aiPro: { price: 19.99, label: 'AI Pro' },
      business: { price: 'contact', label: 'Business' },
    }
  },
  windsurf: {
    name: 'Windsurf',
    plans: {
      free: { price: 0, label: 'Free' },
      pro: { price: 15, label: 'Pro' },
      teams: { price: 35, label: 'Teams' },
      enterprise: { price: 'contact', label: 'Enterprise' },
    }
  },
};

export const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed'];

export const TOOLS_LIST = ['cursor', 'github-copilot', 'claude', 'chatgpt', 'anthropic-api', 'openai-api', 'gemini', 'windsurf'];
