import React, { useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Calendar, User, Stethoscope, Save } from 'lucide-react';

const NewVisit = () => {
  const facilityId = localStorage.getItem('facility_id');
  const [citizenId, setCitizenId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('api/visit/new/', {citizen_id: parseInt(citizenId), reason, facility_id: facilityId});
      setSuccess(true);
      setCitizenId('');
      setReason('');
    } catch (err) {
      console.error('New visit failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Save className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Visit Created!</h1>
          <p className="text-lg text-gray-600 mb-8">Patient has been registered for visit.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            Create Another
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
      <div className="max-w-2xl mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg mb-6">
              <Stethoscope className="w-5 h-5 mr-2" />
              New Patient Visit
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Register New Visit
            </h1>
            <p className="text-xl text-gray-600">Quickly create a new visit record for incoming patient</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Citizen ID
              </label>
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="Enter citizen ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-vertical text-lg h-32"
                placeholder="Describe symptoms, chief complaint, or reason..."
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Creating Visit...
                </>
              ) : (
                <>
                  <Calendar className="w-6 h-6" />
                  Create Visit Record
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewVisit;

