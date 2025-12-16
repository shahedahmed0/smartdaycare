import BillingDashboard from './BillingDashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* টপ হেডার কার্ড */}
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 text-slate-50 rounded-2xl shadow-xl p-6 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Smart Daycare – Module 4
              </h1>
              <p className="mt-1 text-sm text-slate-200">
                Billing, Payment Tracking &amp; Admin Analytics Dashboard
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-300/60">
                Billing &amp; Invoices
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/60">
                Attendance-based charges
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-300/60">
                Admin-only module
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          <BillingDashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
