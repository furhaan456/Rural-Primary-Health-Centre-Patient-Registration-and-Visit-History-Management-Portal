// Patient Profile page displaying full demographic info and visit timeline history
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { Phone, MapPin, Clock, PlusCircle } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch patient details and visit history
  useEffect(() => {
    const fetchProfileAndVisits = async () => {
      try {
        const pRes = await API.get(`/patients/${id}`);
        if (pRes.data.success) {
          setPatient(pRes.data.patient);
        }

        const vRes = await API.get(`/visits/patient/${id}`);
        if (vRes.data.success) {
          setVisits(vRes.data.visits);
        }
      } catch (err) {
        console.error('Error fetching patient profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndVisits();
  }, [id]);

  // Fetch prescriptions for each visit once visits are loaded
  useEffect(() => {
    if (visits.length === 0) return;
    visits.forEach((v) => {
      API.get(`/prescriptions/${v.id}`)
        .then((res) => {
          if (res.data.success) {
            setPrescriptions((prev) => ({ ...prev, [v.id]: res.data.prescription }));
          }
        })
        .catch(console.error);
    });
  }, [visits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1"><Sidebar /><div className="p-8 text-center text-slate-400">Loading patient profile...</div></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1"><Sidebar /><div className="p-8 text-center text-rose-500 font-semibold">Patient record not found.</div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 text-teal-700 p-4 rounded-full font-bold text-xl">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-slate-800">{patient.first_name} {patient.last_name}</h2>
                  <span className="bg-teal-50 text-teal-700 font-mono text-xs px-2.5 py-1 rounded-full font-bold border border-teal-200">
                    {patient.patient_code}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                  {patient.age} yrs • {patient.gender} • Village: <span className="font-semibold text-slate-700">{patient.village_name || 'Rampur'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/visits/new?patientId=${patient.id}`)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-sm"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Today's Visit Token</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demographics Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">Patient Contact Info</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3 text-slate-600">
                  <Phone className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Primary Phone</p>
                    <p className="font-medium text-slate-800">{patient.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-600">
                  <Phone className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Emergency Contact</p>
                    <p className="font-medium text-slate-800">{patient.emergency_contact || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Residence Address</p>
                    <p className="font-medium text-slate-800">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Timeline */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-teal-600" />
                <span>Visit Medical History ({visits.length})</span>
              </h3>

              {visits.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No recorded medical visits for this patient yet.</div>
              ) : (
                <div className="space-y-4">
                  {visits.map((v) => (
                    <div key={v.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      {/* Visit Header */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-teal-700">{v.visit_code}</span>
                        <span className="text-slate-500 font-medium">{v.visit_date}</span>
                      </div>

                      <p className="text-sm font-semibold text-slate-800">Complaint: {v.chief_complaint}</p>

                      {/* Vitals Grid */}
                      <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded border border-slate-200 text-xs text-center text-slate-600">
                        <div>Temp: <span className="font-bold text-slate-800">{v.temp_celsius || '--'} °C</span></div>
                        <div>BP: <span className="font-bold text-slate-800">{v.bp_systolic || '--'}/{v.bp_diastolic || '--'}</span></div>
                        <div>Pulse: <span className="font-bold text-slate-800">{v.pulse_rate || '--'} bpm</span></div>
                        <div>Weight: <span className="font-bold text-slate-800">{v.weight_kg || '--'} kg</span></div>
                      </div>

                      {/* Doctor Diagnosis */}
                      {v.diagnosis && (
                        <div className="text-xs bg-emerald-50 p-2 rounded border border-emerald-100 text-emerald-800">
                          <span className="font-bold">Doctor Diagnosis:</span> {v.diagnosis}
                        </div>
                      )}

                      {/* Prescriptions */}
                      {prescriptions[v.id] && prescriptions[v.id].items && prescriptions[v.id].items.length > 0 && (
                        <div className="text-xs bg-blue-50 p-2 rounded border border-blue-100 text-blue-900">
                          <p className="font-bold mb-1">Prescriptions:</p>
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-blue-100 text-blue-800">
                                <th className="p-1 text-left">Medicine</th>
                                <th className="p-1 text-left">Dosage</th>
                                <th className="p-1 text-left">Frequency</th>
                                <th className="p-1 text-left">Duration</th>
                                <th className="p-1 text-left">Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prescriptions[v.id].items.map((p, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                  <td className="p-1">{p.medicine_name}</td>
                                  <td className="p-1">{p.dosage}</td>
                                  <td className="p-1">{p.frequency}</td>
                                  <td className="p-1">{p.duration}</td>
                                  <td className="p-1">{p.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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

export default PatientProfile;
