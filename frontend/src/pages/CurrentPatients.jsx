import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Stethoscope, Pill, TestTube, Bed, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CurrentPatients = () => {
  const facilityId = localStorage.getItem('facility_id');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admittedCount, setAdmittedCount] = useState(0);

  useEffect(() => {
    fetchCurrentPatients();
  }, []);

  const fetchCurrentPatients = async () => {
    setLoading(true);
    try {
      // Use admitted patients endpoint or current appointments
      const [visitsRes, admittedRes] = await Promise.all([
        api.get(`api/facility/${facilityId}/appointments/today/`), 
        api.get(`api/facility/${facilityId}/patients/admitted/`)
      ]);
      setPatients([...visitsRes.data, ...admittedRes.data]);
      setAdmittedCount(admittedRes.data.length);
    } catch (err) {
      console.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{patients.length}</h3>
                  <p className="text-lg text-gray-600">Current Patients</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Including OPD and admitted</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Bed className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{admittedCount}</h3>
                  <p className="text-lg text-gray-600">Admitted</p>
                </div>
              </div>
              <Link to="/facility-admitted" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                View Admitted <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Patients List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Current Patients ({patients.length})
                </h2>
              </div>
              {patients.length === 0 ? (
                <div className="text-center py-24">
                  <Users className="w-24 h-24 text-gray-300 mx-auto mb-8" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">No current patients</h3>
                  <Link to="/new-visit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Register New Visit
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                    <div key={patient.visit_id || patient.citizen_id} className="p-8 hover:bg-gray-50 transition-colors group">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                            <p className="text-gray-600">ID: {patient.citizen_id} | {patient.reason || patient.status}</p>
                            {patient.admission_date && (
                              <p className="text-sm text-emerald-600 font-semibold mt-1">
                                Admitted: {new Date(patient.admission_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 pt-2 lg:pt-0">
                          <Link 
                            to={`/diagnosis/${patient.visit_id || patient.id}`}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2 text-sm shadow-md"
                          >
                            <Stethoscope className="w-4 h-4" />
                            Diagnosis
                          </Link>
                          
                          <Link 
                            to={`/prescription/${patient.visit_id || patient.id}`}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2 text-sm shadow-md"
                          >
                            <Pill className="w-4 h-4" />
                            Prescription
                          </Link>
                          
                          <Link 
                            to={`/lab-orders/${patient.visit_id || patient.id}`}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2 text-sm shadow-md"
                          >
                            <TestTube className="w-4 h-4" />
                            Lab Tests
                          </Link>

                          <Link 
                            to={`/procedure/${patient.visit_id || patient.id}`}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2 text-sm shadow-md"
                          >
                            <Activity className="w-4 h-4" />
                            Add Underwent Procedure
                          </Link>
                          
                          {patient.ward && !patient.discharge_date && (
                            <Link 
                              to={`/discharge/${patient.visit_id || patient.id}`}
                              className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-purple-600 hover:to-violet-600 transition-all flex items-center gap-2 text-sm shadow-md"
                            >
                              Discharge
                            </Link>
                          )}
                          
                          {!patient.ward && (
                            <Link 
                              to={`/admit/${patient.visit_id || patient.id}`}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 text-sm shadow-md"
                            >
                              Admit
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/new-visit" 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            <Users className="w-6 h-6" />
            New Patient Visit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CurrentPatients;

