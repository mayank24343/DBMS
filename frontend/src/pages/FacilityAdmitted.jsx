import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { User, Bed, HeartPulse, Calendar, Hospital, ArrowRight } from 'lucide-react';

const FacilityAdmitted = () => {
  const facilityId = localStorage.getItem('facility_id');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (facilityId) {
      loadAdmittedPatients();
    }
  }, [facilityId]);

  const loadAdmittedPatients = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.admittedPatients(facilityId);
      setPatients(data);
    } catch (err) {
      setError('Failed to load admitted patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-bold bg-white rounded-xl p-8 shadow-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg shadow-lg mb-6">
            <Bed className="w-5 h-5 mr-2" />
            Currently Admitted
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-red-900 bg-clip-text text-transparent mb-6">
            Admitted Patients ({patients.length})
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            View all currently admitted patients and their ward assignments
          </p>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patients.map((patient) => (
            <Link 
              key={patient.citizen_id} 
              to={`/patient-details/${patient.citizen_id}`}
              className="group bg-white border border-gray-200 hover:border-blue-300 rounded-3xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 p-8 h-full flex flex-col"
            >
              {/* Patient Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {patient.citizen_id}</p>
                </div>
              </div>

              {/* Ward Info */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-200 rounded-xl flex items-center justify-center">
                  <Bed className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                  <p className="font-semibold text-indigo-900">{patient.ward}</p>
                  <p className="text-sm text-indigo-600">Admitted since {patient.admission_date}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex-1 flex flex-col justify-end">
            
                <Link to={`/patient-details/${patient.citizen_id}`} className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700">
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                </Link>
                
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {patients.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-dashed border-gray-300">
            <Bed className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No admitted patients</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
              All wards are ready for new admissions
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-2xl font-bold hover:bg-emerald-200 transition-colors cursor-pointer">
              <Users className="w-5 h-5" />
              Ready to Admit New Patients
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default FacilityAdmitted;
