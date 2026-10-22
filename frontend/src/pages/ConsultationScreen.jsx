// Doctor Consultation screen for entering diagnosis, dynamic multi-item electronic prescriptions, and follow-up
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Stethoscope, Plus, Trash2, Save, Calendar, AlertCircle } from 'lucide-react';

const ConsultationScreen = () => {
  const { id: visitId } = useParams();
  const [diagnosis, setDiagnosis] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');
  const [items, setItems] = useState([
    { medicineName: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', durationDays: '5', instructions: 'Take after food' }
  ]);
  const [patientId, setPatientId] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleAddItem = () => {
    setItems([...items, { medicineName: '', dosage: '500mg', frequency: '1-0-1', durationDays: '5', instructions: 'Take after food' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!diagnosis) {
      setError('Please enter a clinical diagnosis.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Record Diagnosis on Visit
      await API.put(`/visits/${visitId}/diagnosis`, { diagnosis, status: 'completed' });

      // 2. Add Prescription
      await API.post('/prescriptions', {
        visitId: Number(visitId),
        patientId,
        items
      });

      // 3. Schedule Follow-up if set
      if (followUpDate && followUpReason) {
        await API.post('/follow-ups', {
          visitId: Number(visitId),
          patientId,
          followUpDate,
          reason: followUpReason
        });
      }

      alert('Consultation and Prescription recorded successfully!');
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit consultation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-5xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <span>Doctor Consultation & Prescription Builder</span>
            </h2>
            <p className="text-slate-500 text-sm">Record diagnosis, build digital prescriptions, and schedule follow-ups for Visit #{visitId}.</p>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Diagnosis Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3">Clinical Diagnosis & Notes</h3>
              <textarea
                required
                rows="3"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter doctor clinical diagnosis (e.g. Acute Viral Fever with mild throat infection)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              ></textarea>
            </div>

            {/* Dynamic Prescription Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-800">Electronic Prescription Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center space-x-1 bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 font-medium px-3 py-1.5 rounded-lg text-xs transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 items-center">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        required
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                        placeholder="e.g. Amoxicillin / Paracetamol"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Dosage</label>
                      <input
                        type="text"
                        required
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                        placeholder="500mg"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
                      <input
                        type="text"
                        required
                        value={item.frequency}
                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                        placeholder="1-0-1"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Days</label>
                      <input
                        type="number"
                        required
                        value={item.durationDays}
                        onChange={(e) => handleItemChange(index, 'durationDays', e.target.value)}
                        placeholder="5"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                        placeholder="After food"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm outline-none"
                      />
                    </div>

                    <div className="md:col-span-1 text-right pt-4 md:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Follow-up Scheduling */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Schedule Follow-Up Visit (Optional)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Return Visit</label>
                  <input
                    type="text"
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                    placeholder="e.g. Check temperature & blood pressure after 5 days"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition text-sm"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Finalize & Issue Prescription'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ConsultationScreen;
