import { useState } from 'react';

export default function EmailCapture({ onClose, onSubmit, totalSavings }) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check: reject if website field has value
    if (website.trim()) {
      onClose();
      return;
    }

    // Validate email
    if (!email.trim()) {
      alert('Email is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email, companyName, role);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHighSavings = totalSavings > 500;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isHighSavings
            ? 'Save your report — we\'ll connect you with Credex'
            : 'Get notified when new optimizations apply to your stack'}
        </h2>

        {/* Subtext */}
        {isHighSavings && (
          <p className="text-gray-600 text-sm mb-6">
            For high-savings cases, Credex can unlock an additional 20-30% through discounted credits.
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field (hidden) */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ display: 'none' }}
            tabIndex="-1"
            autoComplete="off"
          />

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-normal text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-normal text-gray-700 mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-normal text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            >
              <option value="">Select a role</option>
              <option value="Founder">Founder</option>
              <option value="CTO">CTO</option>
              <option value="Engineering Manager">Engineering Manager</option>
              <option value="Developer">Developer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Get My Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
