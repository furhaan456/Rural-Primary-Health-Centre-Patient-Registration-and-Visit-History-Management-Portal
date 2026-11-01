// Admin Dashboard — gradient stat cards, animated counters, doctor availability, live weekly chart
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { useToast } from '../components/Toast';
import { Users, Calendar, Stethoscope, Activity, UserPlus, BarChart3, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Animated counter hook
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => {
  const count = useCountUp(value);
  return (
    <div className={`card-hover rounded-2xl p-5 text-white shadow-lg animate-fade-in-up ${gradient}`} style={{ animationDelay: delay }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{label}</p>
          <p className="text-4xl font-extrabold mt-1 animate-count-up">{count}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-3 h-1 bg-white/20 rounded-full">
        <div className="h-1 bg-white/60 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, value * 10)}%` }} />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats]       = useState({ totalPatients: 0, visitsToday: 0, totalDoctors: 0, totalVisits: 0 });
  const [visitTrend, setVisitTrend] = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const toast = useToast();

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
        if (doctorRes.data.success) setDoctors(doctorRes.data.doctors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggle = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await API.put(`/doctors/${userId}/toggle-status`);
      if (res.data.success) {
        setDoctors((prev) => prev.map((d) => d.user_id === userId ? { ...d, status: res.data.status } : d));
        toast(`Doctor marked as ${res.data.status}`, 'success');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const chartData = {
    labels: visitTrend.length > 0 ? visitTrend.map((t) => t.day) : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'OPD Footfall (Visits)',
      data: visitTrend.length > 0 ? visitTrend.map((t) => t.visits) : [0,0,0,0,0,0,0],
      borderColor: '#0d9488',
      backgroundColor: 'rgba(13,148,136,0.12)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0d9488',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { grid: { display: false } }
    }
  };

  const statCards = [
    { icon: Users,      label: 'Registered Patients', value: stats.totalPatients, gradient: 'stat-card-teal',   delay: '0.05s' },
    { icon: Calendar,   label: 'Visits Today',         value: stats.visitsToday,   gradient: 'stat-card-green',  delay: '0.10s' },
    { icon: Stethoscope,label: 'Active Doctors',       value: stats.totalDoctors,  gradient: 'stat-card-indigo', delay: '0.15s' },
    { icon: Activity,   label: 'Total Lifetime Visits',value: stats.totalVisits,   gradient: 'stat-card-blue',   delay: '0.20s' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-teal-600" />
              <span>Admin Control Center</span>
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Real-time overview of Rural PHC operational statistics.</p>
          </div>

          {/* Animated Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Chart + Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 card-hover animate-fade-in-up stagger-2">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <span>OPD Patient Visits (Weekly Trend)</span>
              </h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-3">
              <h3 className="text-base font-bold text-slate-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="/patients/register"
                   className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 hover:from-teal-100 hover:to-cyan-100 font-semibold text-sm transition border border-teal-200/60 card-hover">
                  <span className="flex items-center space-x-2"><UserPlus className="h-4 w-4" /><span>Register New Patient</span></span>
                  <span className="text-lg">→</span>
                </a>
                <a href="/admin/reports"
                   className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 hover:from-indigo-100 hover:to-violet-100 font-semibold text-sm transition border border-indigo-200/60 card-hover">
                  <span className="flex items-center space-x-2"><BarChart3 className="h-4 w-4" /><span>Detailed Analytics</span></span>
                  <span className="text-lg">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Doctor Availability Panel */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-4">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              <span>Doctor Availability Management</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Toggle a doctor's availability. Inactive doctors are hidden from the OPD visit token creation form.
            </p>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-slate-400">No doctors registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {doctors.map((d) => (
                  <div key={d.user_id}
                       className={`card-hover flex items-center justify-between p-4 rounded-xl border transition ${
                         d.status === 'active'
                           ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                           : 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200'
                       }`}>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{d.full_name}</p>
                      <p className="text-xs text-slate-500">{d.specialization}</p>
                      <span className={`text-xs font-bold ${d.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {d.status === 'active' ? '● Available' : '○ Unavailable'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggle(d.user_id)}
                      disabled={togglingId === d.user_id}
                      className="ml-2 disabled:opacity-50 transition hover:scale-110 transform"
                      title={d.status === 'active' ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      {d.status === 'active'
                        ? <ToggleRight className="h-9 w-9 text-emerald-500" />
                        : <ToggleLeft  className="h-9 w-9 text-rose-400" />
                      }
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
