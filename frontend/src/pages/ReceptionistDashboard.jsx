// Receptionist Dashboard page for quick patient intake, token generation, and queue management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { UserPlus, Search, Ticket, Calendar, PlusCircle } from 'lucide-react';

const ReceptionistDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await API.get('/visits/queue/today');
        if (res.data.success) {
          setQueue(res.data.queue);
        }
      } catch (err) {
        console.error('Error loading OPD queue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Reception Desk</h2>
              <p className="text-slate-500 text-sm">Register rural patients, create OPD visit tokens, and direct queues.</p>
            </div>

            <button
              onClick={() => navigate('/patients/register')}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-sm"
            >
              <UserPlus className="h-5 w-5" />
              <span>Register New Patient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live OPD Queue */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-teal-600" />
                <span>Today's Issued OPD Tokens Queue</span>
              </h3>

              {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Loading today's queue...</div>
              ) : queue.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No tokens issued today yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3">Token #</th>
                        <th className="py-2.5 px-3">Patient Code</th>
                        <th className="py-2.5 px-3">Patient Name</th>
                        <th className="py-2.5 px-3">Assigned Doctor</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-bold text-slate-700">#{idx + 1}</td>
                          <td className="py-3 px-3 font-medium text-teal-700">{item.patient_code}</td>
                          <td className="py-3 px-3 text-slate-800">{item.first_name} {item.last_name}</td>
                          <td className="py-3 px-3 text-slate-600">{item.doctor_name || 'Dr. Ananya Roy'}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-semibold text-slate-800">Reception Shortcuts</h3>
              
              <button
                onClick={() => navigate('/patients/search')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Search Patient Database</p>
                    <p className="text-xs text-slate-500">Find existing profile by phone or code</p>
                  </div>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={() => navigate('/follow-ups')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Check Upcoming Follow-ups</p>
                    <p className="text-xs text-slate-500">View patients due for checkup today</p>
                  </div>
                </div>
                <span>→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
