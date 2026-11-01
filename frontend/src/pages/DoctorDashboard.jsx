// Doctor Dashboard page showing live OPD patient queue, quick patient search, and consultation actions
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Search, Calendar, RefreshCw, UserCheck } from 'lucide-react';

const DoctorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(null); // visitId being reassigned
  const [reassignDoctorId, setReassignDoctorId] = useState('');

  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const queueRes = await API.get('/visits/queue/today');
      if (queueRes.data.success) {
        setQueue(queueRes.data.queue);
      }

      const followRes = await API.get('/follow-ups/upcoming');
      if (followRes.data.success) {
        setFollowUps(followRes.data.followUps);
      }

      // Fetch doctors list for reassignment (admin only)
      const docRes = await API.get('/doctors');
      if (docRes.data.success) {
        setDoctors(docRes.data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleReassign = async (visitId) => {
    if (!reassignDoctorId) return;
    try {
      const res = await API.put(`/visits/${visitId}/reassign-doctor`, { newDoctorId: reassignDoctorId });
      if (res.data.success) {
        alert('Doctor reassigned successfully!');
        setReassigning(null);
        setReassignDoctorId('');
        fetchData(); // Refresh queue
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign doctor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Doctor OPD Desk</h2>
              <p className="text-slate-500 text-sm">Manage patient consultations, vitals, diagnosis, and prescriptions.</p>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient by ID / name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none w-64"
                />
              </div>
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's OPD Queue */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-800 flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span>Today's Patient Queue</span>
                </h3>
                <button
                  onClick={fetchData}
                  className="text-xs text-teal-600 hover:text-teal-800 flex items-center space-x-1"
                  title="Refresh queue"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Loading queue...</div>
              ) : queue.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No patients in the waiting queue right now.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Patient Name</th>
                        <th className="py-2.5 px-3">Age / Sex</th>
                        <th className="py-2.5 px-3">Chief Complaint</th>
                        <th className="py-2.5 px-3">Assigned Doctor</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.map((item) => (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3 font-semibold text-teal-700">{item.patient_code}</td>
                            <td className="py-3 px-3 font-medium text-slate-800">{item.first_name} {item.last_name}</td>
                            <td className="py-3 px-3 text-slate-600">{item.age} yrs / {item.gender}</td>
                            <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{item.chief_complaint}</td>
                            <td className="py-3 px-3 text-slate-600 text-xs">{item.doctor_name || 'N/A'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/visits/${item.id}/consultation`)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                Consult
                              </button>
                              {/* Reassign Doctor — Admin only */}
                              {isAdmin && item.status !== 'completed' && (
                                <button
                                  onClick={() => {
                                    setReassigning(reassigning === item.id ? null : item.id);
                                    setReassignDoctorId('');
                                  }}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1"
                                  title="Reassign to another doctor"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  <span>Reassign</span>
                                </button>
                              )}
                            </td>
                          </tr>
                          {/* Inline Reassign Panel */}
                          {isAdmin && reassigning === item.id && (
                            <tr>
                              <td colSpan={7} className="bg-indigo-50 px-3 py-3">
                                <div className="flex items-center space-x-3">
                                  <UserCheck className="h-4 w-4 text-indigo-600" />
                                  <span className="text-xs font-semibold text-indigo-800">Reassign Doctor for {item.first_name} {item.last_name}:</span>
                                  <select
                                    value={reassignDoctorId}
                                    onChange={(e) => setReassignDoctorId(e.target.value)}
                                    className="border border-indigo-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                                  >
                                    <option value="">-- Select Doctor --</option>
                                    {doctors.map((d) => (
                                      <option key={d.user_id} value={d.user_id}>
                                        {d.full_name} ({d.specialization})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleReassign(item.id)}
                                    disabled={!reassignDoctorId}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1 rounded text-xs font-medium"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setReassigning(null)}
                                    className="text-xs text-slate-500 hover:text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Upcoming Follow-ups */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Upcoming Follow-ups</span>
              </h3>

              {followUps.length === 0 ? (
                <p className="text-xs text-slate-400">No scheduled follow-up visits pending.</p>
              ) : (
                <div className="space-y-3">
                  {followUps.slice(0, 5).map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{f.first_name} {f.last_name}</p>
                        <p className="text-xs text-slate-500">{f.reason}</p>
                        <p className="text-xs text-teal-600 font-medium mt-1">Date: {f.follow_up_date}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
