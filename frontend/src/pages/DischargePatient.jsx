import React, { useState } from 'react';
import { ArrowLeft, UserCheck, LogOut, Save, Search, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const DischargePatient = () => {
  const [visitId, setVisitId] = useState(useParams().visitId || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  const fetchVisitInfo = async () => {
    try {
      const response = await api.get(`api/visit/${visitId}/`);
      setVisitInfo(response.data);
    } catch (err) {
      console.error('Visit not found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/discharge/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visit_id: visitId })
      });
      setSuccess(true);
    } catch (err) {
      console.error('Discharge failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Patient Discharged!</h1>
          <p className="text-lg text-gray-600 mb-8">Patient successfully discharged from facility.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all"
          >
            Discharge Another
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-lg mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold text-lg shadow-lg mb-6">
              <LogOut className="w-5 h-5 mr-2" />
              Discharge Patient
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Complete Discharge
            </h1>
            <p className="text-xl text-gray-600">Mark patient as discharged from facility</p>
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
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="Enter visit ID to discharge"
                  required
                />
                
              </div>
              {visitInfo && (
                <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="font-semibold text-purple-800">Patient: {visitInfo.name || visitInfo.citizen_name}</div>
                  <div className="text-sm text-purple-700">
                    Ward: {visitInfo.ward_type || 'N/A'} | Admitted: {visitInfo.admission_date || 'N/A'}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Discharge Confirmation</h4>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    This will mark the patient as discharged and free up the bed. Ensure all documentation (discharge summary, follow-up instructions) is complete.
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !visitId}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-purple-700 hover:to-violet-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Processing Discharge...
                </>
              ) : (
                <>
                  <LogOut className="w-6 h-6" />
                  Complete Discharge
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DischargePatient;

