import { runAudit } from '../lib/auditEngine';

describe('auditEngine', () => {
  test('1: recommends Copilot Individual over Business for 2 seats', () => {
    const formData = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        {
          tool: 'github-copilot',
          plan: 'business',
          seats: 2,
          monthlySpend: 38,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].monthlySavings).toBe(18);
    expect(result.recommendations[0].recommendedPlan).toContain('Individual');
    expect(result.recommendations[0].status).toBe('save');
  });

  test('2: recommends Cursor Pro over Business for small team', () => {
    const formData = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        {
          tool: 'cursor',
          plan: 'business',
          seats: 2,
          monthlySpend: 80,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].monthlySavings).toBe(40);
    expect(result.recommendations[0].recommendedPlan).toContain('Pro');
    expect(result.recommendations[0].status).toBe('save');
  });

  test('3: recommends ChatGPT Plus over Team for 2 users', () => {
    const formData = {
      teamSize: 2,
      useCase: 'writing',
      tools: [
        {
          tool: 'chatgpt',
          plan: 'team',
          seats: 2,
          monthlySpend: 60,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].monthlySavings).toBe(20);
    expect(result.recommendations[0].recommendedPlan).toContain('Plus');
    expect(result.recommendations[0].status).toBe('save');
  });

  test('4: flags high API spend for Credex credits', () => {
    const formData = {
      teamSize: 1,
      useCase: 'data',
      tools: [
        {
          tool: 'anthropic-api',
          plan: 'payAsYouGo',
          seats: 1,
          monthlySpend: 300,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(1);
    const rec = result.recommendations[0];
    expect(rec.recommendedAction.toLowerCase()).toContain('credex');
    expect(rec.reason.toLowerCase()).toContain('credex');
    expect(rec.status).toBe('consider');
  });

  test('5: returns isOptimal true when savings under $100', () => {
    const formData = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        {
          tool: 'cursor',
          plan: 'pro',
          seats: 1,
          monthlySpend: 20,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.isOptimal).toBe(true);
    expect(result.totalMonthlySavings).toBeLessThan(100);
  });

  test('6: calculates totalMonthlySavings correctly across multiple tools', () => {
    const formData = {
      teamSize: 2,
      useCase: 'mixed',
      tools: [
        {
          tool: 'github-copilot',
          plan: 'business',
          seats: 2,
          monthlySpend: 38,
        },
        {
          tool: 'chatgpt',
          plan: 'team',
          seats: 2,
          monthlySpend: 60,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(2);
    expect(result.totalMonthlySavings).toBe(38);
  });

  test('7: calculates annual savings as monthly * 12', () => {
    const formData = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        {
          tool: 'cursor',
          plan: 'business',
          seats: 2,
          monthlySpend: 80,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.totalMonthlySavings).toBe(40);
    expect(result.totalAnnualSavings).toBe(480);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  test('8: returns optimal status for correctly sized plans', () => {
    const formData = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        {
          tool: 'github-copilot',
          plan: 'individual',
          seats: 1,
          monthlySpend: 10,
        },
      ],
    };

    const result = runAudit(formData);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].status).toBe('optimal');
    expect(result.recommendations[0].monthlySavings).toBe(0);
  });
});
