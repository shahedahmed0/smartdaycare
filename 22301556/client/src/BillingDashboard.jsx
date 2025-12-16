import { useEffect, useState } from 'react';
import api from './api';

const BillingDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing/invoices');
      setInvoices(res.data);
    } catch {
      setError('Invoices লোড করা যায়নি (backend চলছে কি না দেখো)।');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/summary');
      setAnalytics(res.data);
    } catch {
      setError('Analytics লোড করা যায়নি (backend চলছে কি না দেখো)।');
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchInvoices(), fetchAnalytics()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleGenerateInvoices = async () => {
    try {
      setGenLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      await api.post(`/billing/generate/${year}/${month}`);
      await fetchInvoices();
      await fetchAnalytics();
    } catch {
      setError('Invoice generate করা যায়নি।');
    } finally {
      setGenLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/billing/invoices/${id}/pay`);
      await fetchInvoices();
      await fetchAnalytics();
    } catch {
      setError('Payment update ব্যর্থ হয়েছে।');
    }
  };

  // সামান্য extra analytics
  const avgPerInvoice =
    analytics && analytics.revenue.invoiceCount > 0
      ? analytics.revenue.totalRevenueThisMonth /
        analytics.revenue.invoiceCount
      : 0;

  const avgPerChild =
    analytics && analytics.totalChildren > 0
      ? analytics.revenue.totalRevenueThisMonth / analytics.totalChildren
      : 0;

  const avgChildrenPerStaff =
    analytics && analytics.staffWorkload && analytics.staffWorkload.length > 0
      ? (
          analytics.staffWorkload.reduce(
            (sum, s) => sum + (s.childrenAssignedCount || 0),
            0
          ) / analytics.staffWorkload.length
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top actions row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleGenerateInvoices}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={genLoading}
        >
          {genLoading ? 'Generating…' : 'Generate invoices for current month'}
        </button>

        <div className="flex items-center gap-3 text-sm">
          {loading && <span className="text-slate-500">Loading data…</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* Summary cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">
              Revenue (this month)
            </h2>
            <p className="text-3xl font-bold text-blue-700">
              ৳ {analytics.revenue.totalRevenueThisMonth.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Invoices: {analytics.revenue.invoiceCount} | Paid:{' '}
              {analytics.revenue.paidCount} | Unpaid:{' '}
              {analytics.revenue.unpaidCount}
            </p>

            <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600 space-y-1">
              <p>Avg per invoice: ৳ {avgPerInvoice.toFixed(0)}</p>
              <p>Avg per child: ৳ {avgPerChild.toFixed(0)}</p>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">
              Attendance &amp; Occupancy
            </h2>
            <p className="text-sm text-slate-700">
              Total children:{' '}
              <span className="font-semibold">
                {analytics.totalChildren}
              </span>
            </p>
            <p className="text-sm text-slate-700">
              Avg attendance/week:{' '}
              <span className="font-semibold">
                {analytics.averageAttendancePerWeek.toFixed(1)}
              </span>
            </p>
            <p className="text-sm text-slate-700">
              Busiest hour:{' '}
              <span className="font-semibold">
                {analytics.busiestHour !== null
                  ? `${analytics.busiestHour}:00`
                  : 'No data'}
              </span>
            </p>
          </div>

          {/* Staff & Meals */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-1">
              Staff &amp; Meals
            </h2>
            <p className="text-sm text-slate-700">
              Staff count:{' '}
              <span className="font-semibold">
                {analytics.totalStaff}
              </span>
            </p>
            <p className="text-sm text-slate-700">
              Avg children per staff:{' '}
              <span className="font-semibold">
                {avgChildrenPerStaff}
              </span>
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Meals served:{' '}
              {analytics.mealConsumptionStats
                .map((m) => `${m.meal}: ${m.count}`)
                .join(', ') || 'No data'}
            </p>
          </div>
        </div>
      )}

      {/* Daily occupancy */}
      {analytics && analytics.occupancy && analytics.occupancy.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">
            Daily Occupancy (current month)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Present</th>
                  <th className="px-3 py-2 text-left">Occupancy rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.occupancy.map((row) => (
                  <tr
                    key={row.date}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-1">{row.date}</td>
                    <td className="px-3 py-1">{row.present}</td>
                    <td className="px-3 py-1">
                      {(row.occupancyRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff workload */}
      {analytics && analytics.staffWorkload && analytics.staffWorkload.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Staff Workload</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">Children</th>
                  <th className="px-3 py-2 text-left">Weekly hours</th>
                </tr>
              </thead>
              <tbody>
                {analytics.staffWorkload.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-1">{s.name}</td>
                    <td className="px-3 py-1 capitalize">{s.role}</td>
                    <td className="px-3 py-1">{s.childrenAssignedCount}</td>
                    <td className="px-3 py-1">{s.weeklyHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-600">
            এখনও কোনো invoice নেই। উপরের বাটনে ক্লিক করে generate করো।
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Child</th>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-left">Days</th>
                  <th className="px-3 py-2 text-left">Base/day</th>
                  <th className="px-3 py-2 text-left">Extra</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-3 py-1">
                      {inv.child?.name || 'Unknown'}
                    </td>
                    <td className="px-3 py-1">
                      {inv.month}/{inv.year}
                    </td>
                    <td className="px-3 py-1">{inv.daysPresent}</td>
                    <td className="px-3 py-1">৳ {inv.baseRatePerDay}</td>
                    <td className="px-3 py-1">৳ {inv.extraCharges}</td>
                    <td className="px-3 py-1 font-semibold">
                      ৳ {inv.totalAmount}
                    </td>
                    <td className="px-3 py-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-1">
                      {inv.status === 'unpaid' && (
                        <button
                          onClick={() => handleMarkPaid(inv._id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;
