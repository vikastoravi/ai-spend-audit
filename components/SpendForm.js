import { useState, useEffect } from 'react';
import { PRICING_DATA, TOOLS_LIST, USE_CASES } from '../lib/pricingData';

export default function SpendForm({ onSubmit }) {
  const [teamSize, setTeamSize] = useState('');
  const [useCase, setUseCase] = useState('');
  const [tools, setTools] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('audit-form-state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        /* eslint-disable react-hooks/set-state-in-effect */
        setTeamSize(data.teamSize || '');
        setUseCase(data.useCase || '');
        setTools(data.tools || []);
        /* eslint-enable react-hooks/set-state-in-effect */
      } catch (e) {
        console.error('Failed to load form state:', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state = { teamSize, useCase, tools };
    localStorage.setItem('audit-form-state', JSON.stringify(state));
  }, [teamSize, useCase, tools]);

  const addTool = () => {
    setTools([...tools, { tool: '', plan: '', seats: 1, monthlySpend: 0 }]);
  };

  const removeTool = (index) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index, field, value) => {
    const updatedTools = [...tools];
    updatedTools[index][field] = value;

    // If tool changes, reset plan and recalculate spend
    if (field === 'tool') {
      updatedTools[index].plan = '';
      updatedTools[index].monthlySpend = 0;
    }

    // If plan or seats changes, recalculate spend
    if (field === 'plan' || field === 'seats') {
      const tool = updatedTools[index].tool;
      const plan = updatedTools[index].plan;
      const seats = updatedTools[index].seats;

      if (tool && plan && PRICING_DATA[tool]?.plans[plan]) {
        const planPrice = PRICING_DATA[tool].plans[plan].price;
        if (typeof planPrice === 'number') {
          updatedTools[index].monthlySpend = planPrice * seats;
        } else {
          updatedTools[index].monthlySpend = 0;
        }
      }
    }

    setTools(updatedTools);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      teamSize: parseInt(teamSize) || 0,
      useCase,
      tools: tools.map(t => ({
        tool: t.tool,
        plan: t.plan,
        seats: parseInt(t.seats) || 1,
        monthlySpend: parseFloat(t.monthlySpend) || 0,
      })),
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Info Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          👥 Team Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="teamSize" className="block text-sm font-semibold text-gray-800 mb-2">
              Team Size
            </label>
            <input
              id="teamSize"
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g., 5"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] text-lg font-semibold text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="useCase" className="block text-sm font-semibold text-gray-800 mb-2">
              Primary Use Case
            </label>
            <select
              id="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] text-gray-900 font-medium bg-white"
            >
              <option value="">Select a use case</option>
              {USE_CASES.map(uc => (
                <option key={uc} value={uc}>
                  {uc.charAt(0).toUpperCase() + uc.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          🛠️ AI Tools Spend
        </h2>

        {tools.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <p className="text-gray-500 text-lg font-medium">No tools added yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click &quot;Add Tool&quot; below to get started.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {tools.map((toolEntry, index) => (
              <div key={index} className="border-2 border-[#16a34a] rounded-lg p-5 bg-white hover:shadow-md transition">
                {/* Row 1: Tool and Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Tool Selector */}
                  <div>
                    <label htmlFor={`tool-${index}`} className="block text-sm font-semibold text-gray-800 mb-2">
                      Tool
                    </label>
                    <select
                      id={`tool-${index}`}
                      value={toolEntry.tool}
                      onChange={(e) => updateTool(index, 'tool', e.target.value)}
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] font-medium text-gray-900 bg-white"
                    >
                      <option value="">Select a tool</option>
                      {TOOLS_LIST.map(tool => (
                        <option key={tool} value={tool}>
                          {PRICING_DATA[tool].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Selector */}
                  <div>
                    <label htmlFor={`plan-${index}`} className="block text-sm font-semibold text-gray-800 mb-2">
                      Plan
                    </label>
                    <select
                      id={`plan-${index}`}
                      value={toolEntry.plan}
                      onChange={(e) => updateTool(index, 'plan', e.target.value)}
                      disabled={!toolEntry.tool}
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] font-medium text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
                    >
                      <option value="">Select a plan</option>
                      {toolEntry.tool && PRICING_DATA[toolEntry.tool]?.plans &&
                        Object.entries(PRICING_DATA[toolEntry.tool].plans).map(([key, plan]) => (
                          <option key={key} value={key}>
                            {plan.label}
                            {typeof plan.price === 'number' ? ` ($${plan.price})` : ' (contact)'}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* Row 2: Seats and Monthly Spend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Seats */}
                  <div>
                    <label htmlFor={`seats-${index}`} className="block text-sm font-semibold text-gray-800 mb-2">
                      Number of Seats
                    </label>
                    <input
                      id={`seats-${index}`}
                      type="number"
                      min="1"
                      value={toolEntry.seats}
                      onChange={(e) => updateTool(index, 'seats', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] text-lg font-bold text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Monthly Spend */}
                  <div>
                    <label htmlFor={`spend-${index}`} className="block text-sm font-semibold text-gray-800 mb-2">
                      Monthly Spend ($)
                    </label>
                    <div className="relative">
                      <input
                        id={`spend-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={toolEntry.monthlySpend}
                        onChange={(e) => updateTool(index, 'monthlySpend', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-3 border-2 border-[#16a34a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] text-lg font-bold text-[#16a34a] bg-green-50 placeholder-gray-400"
                      />
                      <span className="absolute right-4 top-3 text-2xl font-bold text-[#16a34a]">💰</span>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeTool(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-semibold px-3 py-1 rounded transition"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addTool}
          className="w-full px-4 py-3 border-2 border-[#16a34a] text-[#16a34a] rounded-lg hover:bg-[#16a34a] hover:text-white font-bold text-lg transition"
        >
          + Add Tool
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-[#15803d] hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition shadow-lg text-lg hover:shadow-xl"
      >
        🚀 Get My Audit
      </button>
    </form>
  );
}
