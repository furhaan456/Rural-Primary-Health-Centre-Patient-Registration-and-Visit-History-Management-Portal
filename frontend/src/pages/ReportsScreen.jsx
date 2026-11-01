// Admin Reports & Chart.js Visualizations screen (Phase 10)
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { BarChart3, Users, Calendar, MapPin } from 'lucide-react';

// Chart.js setup
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const ReportsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/reports/overview');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1"><Sidebar /><div className="p-8 text-center text-slate-400">Loading PHC analytics & chart reports...</div></div>
      </div>
    );
  }

  const villageBarData = {
    labels: data.villageDistribution.map(v => v.village_name),
    datasets: [
      {
        label: 'Registered Patients',
        data: data.villageDistribution.map(v => v.patient_count),
        backgroundColor: '#0d9488',
        borderRadius: 6,
      },
    ],
  };

  const lineTrendData = {
    labels: data.visitTrend.map(t => t.day),
    datasets: [
      {
        label: 'Daily OPD Visits',
        data: data.visitTrend.map(t => t.visits),
        borderColor: '#6366f1',
        backgroundColor: '#e0e7ff',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-teal-600" />
              <span>PHC Healthcare Analytics & Reports</span>
            </h2>
            <p className="text-slate-500 text-sm">Village patient demographic distribution and daily OPD visit trends.</p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-lg"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Registered Patients</p>
                <p className="text-2xl font-bold text-slate-800">{data.stats.totalPatients}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Visits Today</p>
                <p className="text-2xl font-bold text-slate-800">{data.stats.visitsToday}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg"><BarChart3 className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Lifetime Visits</p>
                <p className="text-2xl font-bold text-slate-800">{data.stats.totalVisits}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-lg"><MapPin className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Villages Covered</p>
                <p className="text-2xl font-bold text-slate-800">{data.villageDistribution.length}</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                <span>Village-wise Patient Distribution (Bar Chart)</span>
              </h3>
              <div className="h-64 flex justify-center items-center">
                <Bar
                  data={villageBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>OPD Visit Trend Over Time (Line Chart)</span>
              </h3>
              <div className="h-64 flex justify-center items-center">
                <Line
                  data={lineTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } }
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsScreen;
