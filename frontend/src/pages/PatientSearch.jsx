// Patient Search page with live filtering table
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Search, Eye, PlusCircle } from 'lucide-react';

const PatientSearch = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await API.get(`/patients/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(query);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Search className="h-6 w-6 text-teal-600" />
              <span>Search Patient Records</span>
            </h2>
            <p className="text-slate-500 text-sm">Find patients by Patient Code, Full Name, or Phone Number.</p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type patient code (e.g. PHC-2026-0001), name, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Search Results ({patients.length})</h3>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Searching records...</div>
            ) : patients.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No matching patient records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Patient Code</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Gender / Age</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Village</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-semibold text-teal-700">{p.patient_code}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{p.first_name} {p.last_name}</td>
                        <td className="py-3 px-3 text-slate-600 capitalize">{p.gender} / {p.age} yrs</td>
                        <td className="py-3 px-3 text-slate-600">{p.phone}</td>
                        <td className="py-3 px-3 text-slate-600">{p.village_name || 'Rampur'}</td>
                        <td className="py-3 px-3 flex space-x-2">
                          <button
                            onClick={() => navigate(`/patients/${p.id}`)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1 rounded text-xs font-medium flex items-center space-x-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Profile</span>
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

export default PatientSearch;
