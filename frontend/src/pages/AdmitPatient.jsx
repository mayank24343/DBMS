import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bed, User, Hospital, Save, Search } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AdmitPatient = () => {
  const [visitId, setVisitId] = useState(useParams().visitId || '');
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const facilityId = localStorage.getItem('facility_id');
      const response = await api.get(`api/wards/${facilityId}/`);
      setWards(response.data);
    } catch (err) {
      console.error('Failed to fetch wards');
    }
  };

  const fetchVisitInfo = async () => {
    try {
      const response = await api.get(`api/visit/id/${visitId}/`);
      setVisitInfo(response.data);
    } catch (err) {
      console.error('Visit not found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        try {
      const response = await api.get(`api/visit/id/${visitId}/`);
      setVisitInfo(response.data);
    } catch (err) {
      console.error('Visit not found');
    }
    console.log(visitInfo);
      await fetch(`http://127.0.0.1:8000/api/admission/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            citizen_id : visitInfo.citizen_id,
            visit_id: visitId,
          ward_id: parseInt(selectedWard)
        })
      });
      setSuccess(true);
    } catch (err) {
      console.error('Admission failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bed className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Patient Admitted!</h1>
          <p className="text-lg text-gray-600 mb-8">Patient successfully admitted to selected ward.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
          >
            Admit Another
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back to Visits
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
          Back to Visits
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg shadow-lg mb-6">
              <Bed className="w-5 h-5 mr-2" />
              Admit Patient
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-green-900 bg-clip-text text-transparent mb-4">
              Admit to Ward
            </h1>
            <p className="text-xl text-gray-600">Assign patient to appropriate ward bed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Visit ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={visitId}
                  onChange={(e) => setVisitId(e.target.value)}
                  onBlur={fetchVisitInfo}
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="Enter visit ID"
                  required
                />
                
              </div>
              {visitInfo && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="font-semibold text-green-800">Patient: {visitInfo.name || visitInfo.citizen_name}</div>
                  <div className="text-sm text-green-700">Reason: {visitInfo.reason}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Hospital className="w-4 h-4" />
                Available Wards
              </label>
              <div className="space-y-3">
                {wards.map((ward) => (
                  <label key={ward.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group">
                    <input
                      type="radio"
                      name="ward"
                      value={ward.id}
                      checked={selectedWard === ward.id.toString()}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 group-hover:text-green-900">{ward.type}</div>
                      <div className="text-sm text-gray-600">
                        {ward.available > 0 ? `${ward.available} bed${ward.available > 1 ? 's' : ''} available` : 'FULL'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedWard && (
                <p className="mt-2 text-sm text-green-600 font-semibold">
                  Selected: {wards.find(w => w.id == selectedWard)?.type}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedWard}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Admiting Patient...
                </>
              ) : (
                <>
                  <Bed className="w-6 h-6" />
                  Admit Patient to Ward
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdmitPatient;

