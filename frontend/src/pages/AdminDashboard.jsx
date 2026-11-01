// Admin Dashboard page displaying overall metrics, quick links, visit trends chart, and doctor availability management
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Users, Calendar, Stethoscope, Activity, UserPlus, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

// Chart.js registration
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalPatients: 0, visitsToday: 0, totalDoctors: 0, totalVisits: 0 });
  const [visitTrend, setVisitTrend] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, doctorRes] = await Promise.all([
          API.get('/reports/overview'),
          API.get('/doctors'),
        ]);
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
          if (statsRes.data.visitTrend) setVisitTrend(statsRes.data.visitTrend);
        }
        if (doctorRes.data.success) {
          setDoctors(doctorRes.data.doctors);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await API.put(`/doctors/${userId}/toggle-status`);
      if (res.data.success) {
        setDoctors((prev) =>
          prev.map((d) =>
            d.user_id === userId ? { ...d, status: res.data.status } : d
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update doctor status.');
    } finally {
      setTogglingId(null);
    }
  };

  const chartData = {
    labels: visitTrend.length > 0 ? visitTrend.map((t) => t.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'OPD Footfall (Visits)',
        data: visitTrend.length > 0 ? visitTrend.map((t) => t.visits) : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#0d9488',
        backgroundColor: '#ccfbf1',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, stepSize: 1 }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Admin Control Center</h2>
            <p className="text-slate-500 text-sm">Overview of Rural PHC operational statistics and metrics.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-lg"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Registered Patients</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.totalPatients}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Visits Today</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.visitsToday}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg"><Stethoscope className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Doctors</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.totalDoctors}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg"><Activity className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Lifetime Visits</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? '...' : stats.totalVisits}</p>
              </div>
            </div>
          </div>

          {/* Chart & Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <span>OPD Patient Visits (Weekly Trend)</span>
              </h3>
              <div className="h-64 flex justify-center items-center">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Administrative Links</h3>
              <div className="space-y-3">
                <a
                  href="/patients/register"
                  className="flex items-center justify-between p-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium text-sm transition"
                >
                  <span className="flex items-center space-x-2"><UserPlus className="h-4 w-4" /><span>Register New Patient</span></span>
                  <span>→</span>
                </a>

                <a
                  href="/admin/reports"
                  className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm transition"
                >
                  <span className="flex items-center space-x-2"><BarChart3 className="h-4 w-4" /><span>Detailed Analytics & Reports</span></span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Doctor Availability Management Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              <span>Doctor Availability Management</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Toggle a doctor's availability. Inactive doctors will not appear as an option when creating new OPD visits.
            </p>

            {loading ? (
              <p className="text-sm text-slate-400">Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-slate-400">No doctors registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {doctors.map((d) => (
                  <div
                    key={d.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      d.status === 'active'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{d.full_name}</p>
                      <p className="text-xs text-slate-500">{d.specialization}</p>
                      <span className={`text-xs font-bold ${d.status === 'active' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {d.status === 'active' ? '● Available' : '○ Unavailable'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(d.user_id)}
                      disabled={togglingId === d.user_id}
                      title={d.status === 'active' ? 'Mark as Unavailable' : 'Mark as Available'}
                      className="ml-2 disabled:opacity-50"
                    >
                      {d.status === 'active' ? (
                        <ToggleRight className="h-8 w-8 text-emerald-600 hover:text-emerald-800" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-rose-400 hover:text-rose-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
