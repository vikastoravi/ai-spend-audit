# Tests

Run all tests with:

```bash
npm test
```

## Test Suite: auditEngine

| # | Test Name | What It Covers | Filename |
|---|-----------|----------------|----------|
| 1 | recommends Copilot Individual over Business for 2 seats | Validates that GitHub Copilot Business plan is downgraded to Individual for 2 seats with $18 monthly savings | `__tests__/auditEngine.test.js` |
| 2 | recommends Cursor Pro over Business for small team | Validates that Cursor Business plan is downgraded to Pro for 2 seats with $40 monthly savings | `__tests__/auditEngine.test.js` |
| 3 | recommends ChatGPT Plus over Team for 2 users | Validates that ChatGPT Team plan is downgraded to Plus for 2 users with $20 monthly savings | `__tests__/auditEngine.test.js` |
| 4 | flags high API spend for Credex credits | Validates that high Anthropic API spend ($300/month) flags recommendation for Credex credits | `__tests__/auditEngine.test.js` |
| 5 | returns isOptimal true when savings under $100 | Validates that isOptimal flag is true when total savings are below $100 | `__tests__/auditEngine.test.js` |
| 6 | calculates totalMonthlySavings correctly across multiple tools | Validates that savings are aggregated correctly across multiple tools (Copilot + ChatGPT = $38 total) | `__tests__/auditEngine.test.js` |
| 7 | calculates annual savings as monthly * 12 | Validates that annual savings are calculated as monthly savings multiplied by 12 months | `__tests__/auditEngine.test.js` |
| 8 | returns optimal status for correctly sized plans | Validates that correctly sized plans return `optimal` status with zero savings | `__tests__/auditEngine.test.js` |

## Run Options

- **All tests:** `npm test`
- **Watch mode:** `npm test -- --watch`
- **With coverage:** `npm test -- --coverage`
- **Specific file:** `npm test auditEngine.test.js`

## Test Environment

- **Framework:** Jest
- **Node environment:** Node.js
- **Module mapping:** `@/` paths mapped to project root
