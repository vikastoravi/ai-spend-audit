import { useRouter } from 'next/router';
import SpendForm from '../components/SpendForm';

export default function Home() {
  const router = useRouter();

  const handleFormSubmit = (formData) => {
    // Save form data to localStorage
    localStorage.setItem('audit-result-input', JSON.stringify(formData));
    // Navigate to results page
    router.push('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 md:pt-24 pb-12 md:pb-16 px-4">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#16a34a] rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#16a34a] rounded-full opacity-5 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* No Login Required Badge */}
          <div className="inline-block mb-6 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-[#16a34a] border-2 border-[#16a34a] shadow-sm">
              ✓ No login required • Free forever
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            Find Out If You're Overpaying for <span className="text-[#16a34a]">AI Tools</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-medium">
            Free audit for startups. See exactly where your AI budget is going and how much you could save.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-[#16a34a] mb-2">8</div>
              <p className="text-gray-700 font-medium">AI Tools Tracked</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-[#16a34a] mb-2">2min</div>
              <p className="text-gray-700 font-medium">Complete Audit</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
              <div className="text-4xl font-bold text-[#16a34a] mb-2">30%</div>
              <p className="text-gray-700 font-medium">Avg. Savings Found</p>
            </div>
          </div>

          {/* CTA Text */}
          <p className="text-gray-600 text-lg font-medium">
            👇 Start your free audit below
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your AI Spending Breakdown
            </h2>
            <p className="text-gray-600">
              Tell us about your team and we'll analyze your spending across all tools
            </p>
          </div>
          
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            <SpendForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-r from-[#16a34a] to-emerald-600 text-white py-12 px-4 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg font-semibold mb-4">
            🔒 Your data is never stored. This audit is completely private.
          </p>
          <p className="text-green-100">
            Built by engineers who know how much AI tools cost.
          </p>
        </div>
      </div>
    </div>
  );
}
