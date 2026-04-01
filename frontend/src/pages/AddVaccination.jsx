import React, { useState, useEffect } from 'react';
import { ArrowLeft, Syringe, Save, Search } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AddVaccination = () => {
  const { visitId } = useParams();
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState('');
  const [doseNo, setDoseNo] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [citizenId, setCitizenId] = useState(0);
  const [citizenInfo, setCitizenInfo] = useState(null);

  useEffect(() => {
    fetchVaccines();
    fetchFacilities();
    if (visitId) {
      fetchCitizenIdFromVisit(visitId);
    }
  }, [visitId]);

  const fetchVaccines = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/medicines/');
      const data = await response.json();
      setVaccines(data.filter(v => v.type === 'vaccine'));
    } catch (err) {
      console.error('Failed to fetch vaccines');
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('api/facilities/');
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities');
    }
  };

  const fetchCitizenIdFromVisit = async (visitId) => {
    try {
      const response = await api.get(`api/visit/id/${visitId}/`);
      const id = response.data.citizen_id;
      console.log(id);
      setCitizenId(id);
      console.log(citizenId);
      const citizenResponse = await api.get(`api/facility/get-patient/${id}`);
      setCitizenInfo(citizenResponse.data);
    } catch (err) {
      console.error('Failed to fetch citizen from visit');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/vaccination/${visitId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: citizenId,
          item_id: parseInt(selectedVaccineId),
          dose_number: parseInt(doseNo),
          centre_id: parseInt(facilityId),
          notes
        })
      });
      setSuccess(true);
      setSelectedVaccineId('');
      setDoseNo('');
      setFacilityId('');
      setNotes('');
    } catch (err) {
      console.error('Vaccination add failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Syringe className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Vaccination Recorded!</h1>
          <p className="text-lg text-gray-600 mb-8">Vaccination successfully added to record.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all w-full mb-4"
          >
            Record Another
          </button>
          <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-semibold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-green-50 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg shadow-lg mb-6">
              <Syringe className="w-5 h-5 mr-2" />
              Record Vaccination
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
              Administer Vaccine
            </h1>
<p className="text-xl text-gray-600">Record vaccination for patient visit (Visit ID: <span className="font-bold text-emerald-700">{visitId}</span>) | Citizen: <span className="font-bold">{citizenInfo ? citizenInfo.name : 'Loading...'}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Citizen Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-100">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Patient Information
              </label>
              {citizenInfo ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-900">Name: {citizenInfo.name}</p>
                  <p className="text-gray-600">DOB: {citizenInfo.dob} | Gender: {citizenInfo.gender}</p>
                  <p className="text-sm text-emerald-700 font-medium">Citizen ID: {citizenId}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Loading...</p>
              )}
            </div>

            {/* Vaccine Select */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Vaccine
              </label>
              <select 
                value={selectedVaccineId}
                onChange={(e) => setSelectedVaccineId(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                required
              >
                <option value="">Select vaccine</option>
                {vaccines.map((vaccine) => (
                  <option key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dose */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Dose Number
              </label>
              <input
                type="number"
                min="1"
                value={doseNo}
                onChange={(e) => setDoseNo(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="e.g. 1, 2, 3"
                required
              />
            </div>

            {/* Facility */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Administering Facility
              </label>
              <select 
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                required
              >
                <option value="">Select facility</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Notes / Batch Info
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-vertical text-lg h-32"
                placeholder="Batch number, side effects observed, next dose date..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedVaccineId || !doseNo || !facilityId}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Recording Vaccination...
                </>
              ) : (
                <>
                  <Syringe className="w-6 h-6" />
                  Record Vaccination
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVaccination;

