// Follow-up appointment schedule viewer screen with mark-complete action
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const FollowUpsScreen = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const toast = useToast();

  const fetchFollowUps = async () => {
    try {
      const res = await API.get('/follow-ups/upcoming');
      if (res.data.success) {
        setFollowUps(res.data.followUps);
      }
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      const res = await API.put(`/follow-ups/${id}/complete`);
      if (res.data.success) {
        // Remove from list since it's now completed
        setFollowUps((prev) => prev.filter((f) => f.id !== id));
      }
        toast('Follow-up marked as completed!', 'success');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to mark as completed.', 'error');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-teal-600" />
              <span>Upcoming Patient Follow-Up Appointments</span>
            </h2>
            <p className="text-slate-500 text-sm">Schedule tracking list of rural patients scheduled for return consultations.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading upcoming follow-ups...</div>
            ) : followUps.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No upcoming follow-up appointments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Patient Code</th>
                      <th className="py-2.5 px-3">Patient Name</th>
                      <th className="py-2.5 px-3">Contact Phone</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Attending Doctor</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {followUps.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-semibold text-teal-700">{f.follow_up_date}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{f.patient_code}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{f.first_name} {f.last_name}</td>
                        <td className="py-3 px-3 text-slate-600">{f.phone}</td>
                        <td className="py-3 px-3 text-slate-600">{f.reason}</td>
                        <td className="py-3 px-3 text-slate-600">{f.doctor_name || 'Dr. Ananya Roy'}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleComplete(f.id)}
                            disabled={completing === f.id}
                            className="flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-medium disabled:opacity-50 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{completing === f.id ? 'Saving...' : 'Mark Complete'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FollowUpsScreen;
