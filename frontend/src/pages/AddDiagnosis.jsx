import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Save, Search } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AddDiagnosis = () => {
    const id = useParams().visitId;
  const [visitId, setVisitId] = useState(id || '');
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  useEffect(() => {
    // Fetch diseases list - assume endpoint exists or mock
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      // Assume /api/diseases/ endpoint
      const response = await fetch('http://127.0.0.1:8000/api/diseases/');
      const data = await response.json();
      setDiseases(data);
    } catch (err) {
      console.error('Failed to fetch diseases');
    }
  };

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
      await fetch(`http://127.0.0.1:8000/api/diagnosis/${visitId}/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          disease_id: parseInt(selectedDisease),
          description
        })
      });
      setSuccess(true);
      setVisitId('');
      setSelectedDisease('');
      setDescription('');
    } catch (err) {
      console.error('Diagnosis add failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Save className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Diagnosis Added!</h1>
          <p className="text-lg text-gray-600 mb-8">Diagnosis successfully recorded for the visit.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
          >
            Add Another
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
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
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg mb-6">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Add Diagnosis
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-orange-900 bg-clip-text text-transparent mb-4">
              Record Diagnosis
            </h1>
            <p className="text-xl text-gray-600">Document diagnosis for patient visit</p>
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
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="Enter visit ID"
                  required
                />
                
              </div>
              {visitInfo && (
                <p className="mt-2 text-sm text-green-600 font-semibold">
                  Patient: {visitInfo.citizen_name} - Reason: {visitInfo.reason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Disease
              </label>
              <select 
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-lg"
                required
              >
                <option value="">Select disease</option>
                {diseases.map((disease) => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Description / Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-vertical text-lg h-32"
                placeholder="Clinical findings, symptoms, observations..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Saving Diagnosis...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Diagnosis
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDiagnosis;

