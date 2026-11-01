// New OPD Visit creation screen for recording chief complaints and initial vitals
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Ticket, Save, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const VisitScreen = () => {
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId') || '';

  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery,
    doctorId: '2', // Default Doctor ID
    chiefComplaint: '',
    tempCelsius: '',
    bpSystolic: '',
    bpDiastolic: '',
    pulseRate: '',
    weightKg: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        if (res.data.success && res.data.doctors.length > 0) {
          // Only show active/available doctors in the dropdown
          const activeDoctors = res.data.doctors.filter(d => d.status === 'active' || !d.status);
          setDoctors(activeDoctors);
          if (activeDoctors.length > 0) {
            setFormData((prev) => ({ ...prev, doctorId: activeDoctors[0].user_id }));
          }
        }
      } catch (err) {
        console.error('Error fetching doctor list:', err);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientId || !formData.chiefComplaint) {
      setError('Patient ID and Chief Complaint are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await API.post('/visits', formData);
      if (res.data.success) {
        toast(`OPD Visit Token #${res.data.tokenNumber} Generated Successfully!`, 'success');
        navigate('/reception/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate visit token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Ticket className="h-6 w-6 text-teal-600" />
              <span>Create Today's OPD Visit Token</span>
            </h2>
            <p className="text-slate-500 text-sm">Issue an OPD token, record chief complaints, and take preliminary vitals.</p>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID *</label>
                  <input
                    type="number"
                    name="patientId"
                    required
                    value={formData.patientId}
                    onChange={handleChange}
                    placeholder="Enter Patient ID (e.g. 1)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Doctor *</label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {doctors.map((d) => (
                      <option key={d.user_id} value={d.user_id}>
                        {d.full_name} ({d.specialization})
                      </option>
                    ))}
                    {doctors.length === 0 && <option value="2">Dr. Ananya Roy (General Physician)</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint *</label>
                <textarea
                  name="chiefComplaint"
                  required
                  rows="2"
                  value={formData.chiefComplaint}
                  onChange={handleChange}
                  placeholder="e.g. High fever for 3 days, dry cough, severe headache"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                ></textarea>
              </div>

              {/* Vitals Input */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">Preliminary Vitals Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="tempCelsius"
                      value={formData.tempCelsius}
                      onChange={handleChange}
                      placeholder="38.5"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">BP Systolic</label>
                    <input
                      type="number"
                      name="bpSystolic"
                      value={formData.bpSystolic}
                      onChange={handleChange}
                      placeholder="120"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">BP Diastolic</label>
                    <input
                      type="number"
                      name="bpDiastolic"
                      value={formData.bpDiastolic}
                      onChange={handleChange}
                      placeholder="80"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      name="pulseRate"
                      value={formData.pulseRate}
                      onChange={handleChange}
                      placeholder="72"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      name="weightKg"
                      value={formData.weightKg}
                      onChange={handleChange}
                      placeholder="60.0"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Generating Token...' : 'Issue OPD Token'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisitScreen;
