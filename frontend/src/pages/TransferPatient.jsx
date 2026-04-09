import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCheck, ArrowRightLeft, Save, Search, AlertTriangle, MapPin } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const TransferPatient = () => {
  const { visitId } = useParams();
  const [visitInfo, setVisitInfo] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Transferred Successfully")

  useEffect(() => {
    if (visitId) {
      fetchVisitInfo();
      fetchFacilities();
    }
  }, [visitId]);

  const fetchVisitInfo = async () => {
    try {
      const response = await api.get(`api/visit/id/${visitId}/`);
      setVisitInfo({'citizen_id': response.data.citizen_id});
      console.log(visitInfo);
    } catch (err) {
      console.error('Visit not found');
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get(`api/facilities/`);
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities');
    }
  };

  const fetchWards = async (facId) => {
    setFacilityLoading(true);
    try {
      const response = await api.get(`api/wards/${facId}/`);
      setWards(response.data || []);
    } catch (err) {
      console.error('Failed to fetch wards');
      setWards([]);
    } finally {
      setFacilityLoading(false);
    }
  };

  const handleFacilityChange = (e) => {
    const facId = e.target.value;
    setSelectedFacilityId(facId);
    setSelectedWardId('');
    if (facId) {
      fetchWards(facId);
    } else {
      setWards([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/transfer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: parseInt(visitId),
          citizen_id: visitInfo.citizen_id,
          from_fac: localStorage.getItem('facilityId'),
          to_fac: parseInt(selectedFacilityId),
          ward_id: parseInt(selectedWardId),
          reason
        })
      });
     if (response.status != 200){
      setMessage("Could Not Process Request Try Again")
     }
      setSuccess(true);
    } catch (err) {
      console.error('Transfer failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ArrowRightLeft className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{message}</h1>
          <p className="text-lg text-gray-600 mb-8"></p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all w-full mb-4"
          >
            Transfer Another
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg mb-6">
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Transfer Patient
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
              Transfer to New Facility
            </h1>
            <p className="text-xl text-gray-600">Move admitted patient to different facility/ward (Visit ID: <span className="font-bold text-emerald-700">{visitId}</span>)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Visit Info */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-100">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Current Visit Info
              </label>
              {visitInfo ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-900">Patient: {visitInfo.citizen_name || visitInfo.name}</p>
                  <p className="text-gray-600">Reason: {visitInfo.reason}</p>
                  <p className="text-sm font-medium text-emerald-700">Current Facility ID: {visitInfo.facility_id || visitInfo.centre_id}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Loading...</p>
              )}
            </div>

            {/* Target Facility */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Target Facility
              </label>
              <select 
                value={selectedFacilityId}
                onChange={handleFacilityChange}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                required
              >
                <option value="">Select target facility</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Ward */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Target Ward
              </label>
              <select 
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                disabled={facilityLoading || !selectedFacilityId}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg disabled:opacity-50"
                required
              >
                <option value="">Select ward (after facility)</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.type} ({ward.available} beds available)
                  </option>
                ))}
              </select>
              {facilityLoading && <p className="text-sm text-emerald-600 mt-1">Loading wards...</p>}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Transfer Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-vertical text-lg h-32"
                placeholder="Medical reason for transfer, specialist availability, capacity issues..."
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedWardId || facilityLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Transferring Patient...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-6 h-6" />
                  Transfer Patient
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferPatient;

