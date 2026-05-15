# Prompts

This document captures the prompts used in the AI Spend Audit project, the reasoning behind them, and lessons learned.

## Gemini API Summary Generation Prompt

**Location:** `pages/api/generate-summary.js`

### The Full Prompt

```
You are an AI spend optimization advisor. Given this audit result, write a personalized 100-word summary paragraph for the user. Be specific about their tools and savings. Be encouraging but honest. Don't use bullet points — write flowing prose.
Audit data: [JSON of auditResult]
Team size: [teamSize]
Primary use case: [useCase]
```

### Why I Wrote It This Way

1. **Role definition first** — "optimization advisor" sets the tone and expertise level. LLMs respond better to clear context about who they're supposed to be.

2. **Word count constraint** — 100 words is tight enough to force coherence but flexible enough to be useful. Prevents wall-of-text responses while allowing personalization.

3. **Specific instructions** — "Be specific about their tools and savings" and "Don't use bullet points — write flowing prose" are explicit guardrails. Without them, responses tend toward generic formatting that doesn't fit our UI.

4. **Tone guidance** — "encouraging but honest" prevents cheerleading while maintaining positivity. This matters for credibility.

5. **Passing structured data** — Including JSON context instead of summarized text gives the LLM the raw facts to work with. It can extract what's relevant rather than relying on our summaries.

### What I Tried That Didn't Work

#### Alternative 1: Shorter, more directive prompt
```
Generate a 50-word summary of this audit. Focus on savings and top recommendation.
Audit data: [JSON]
```

**Why it failed:** At 50 words, responses became too terse and lost personalization. They felt robotic: "You could save $X by switching from Y to Z." Also, LLMs often ignore word counts as hard constraints—we'd get 60-80 words anyway.

#### Alternative 2: Bullet-point template
```
Write a summary with these sections:
- Current spend: $X/month
- Potential savings: $Y/month
- Top recommendation: [tool]
- Next steps: [action]
```

**Why it failed:** Users found the structured bullet format jarring compared to the natural flow of the page. It looked like automation rather than a personalized report. Also, it reduced the context LLMs had to work with—they got instructions but not the full audit data to reference.

### Why The Fallback Template Matters

**The fallback is not a backup—it's a feature.**

Here's why:

1. **Gemini API reliability** — Google's API is generally solid, but network issues, rate limits, and key problems happen in production. We can't force users to wait or show error states.

2. **Cost control** — Every Gemini call costs money. The fallback template costs zero and still delivers real value. It's generated from actual audit data, not generic text.

3. **User trust** — If a user sees error messages, they doubt the entire tool. A quality fallback summary (personalized with their actual numbers) keeps the experience smooth and trustworthy.

4. **Personalized data** — The fallback isn't a generic message. It calculates:
   - Team size from their input
   - Total spend from their tools
   - Number of platforms they use
   - Their actual monthly savings
   - Their top recommendation
   - Conditional messaging based on their savings tier or optimization status

   This is often *more relevant* than an LLM summary because it's 100% factual.

5. **Graceful degradation** — If the LLM fails, users still get a solid report. If it succeeds, they get a richer, more context-aware summary. Either way, the product works.

## Design Philosophy

The core principle: **Always deliver value, with or without the LLM.**

When building features that depend on external APIs, we plan for failure first. The fallback isn't an afterthought—it's co-designed with the primary flow. This is why the fallback template is parameterized with real audit data rather than a canned message.

## Future Improvements

- Test prompt variations with different user cohorts (e.g., smaller teams vs. enterprises)
- Add A/B testing between LLM and template summaries to measure engagement
- Track Gemini API failures to identify patterns (time of day, key exhaustion, etc.)
- Consider caching generated summaries to reduce API calls for repeat audits
