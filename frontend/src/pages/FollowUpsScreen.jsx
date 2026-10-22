// Follow-up appointment schedule viewer screen
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Calendar, User, Phone, CheckCircle2 } from 'lucide-react';

const FollowUpsScreen = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchFollowUps();
  }, []);

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
