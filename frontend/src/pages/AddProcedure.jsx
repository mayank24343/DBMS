import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scissors, Plus, Save, Search, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AddProcedure = () => {
  const [visitId, setVisitId] = useState(useParams().visitId || '');
  const [procedures, setProcedures] = useState([]); // Available procedures
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      // Assume /api/procedures/ endpoint
      const response = await fetch('http://127.0.0.1:8000/api/procedures/');
      const data = await response.json();
      setProcedures(data);
    } catch (err) {
      console.error('Failed to fetch procedures');
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

  const toggleProcedure = (procedureId) => {
    setSelectedProcedures(prev => 
      prev.includes(procedureId) 
        ? prev.filter(id => id !== procedureId)
        : [...prev, procedureId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/procedure/${visitId}/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          procedure_ids: selectedProcedures
        })
      });
      setSuccess(true);
    } catch (err) {
      console.error('Procedure add failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Save className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Procedures Recorded!</h1>
          <p className="text-lg text-gray-600 mb-8">{selectedProcedures.length} procedure(s) added to visit record.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            Add More
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
      <div className="max-w-3xl mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg mb-6">
              <Scissors className="w-5 h-5 mr-2" />
              Procedures
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Record Procedures
            </h1>
            <p className="text-xl text-gray-600">Document surgical/other procedures performed</p>
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
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="Enter visit ID"
                  required
                />
                
              </div>
              {visitInfo && (
                <p className="mt-2 text-sm text-green-600 font-semibold">
                  Patient: {visitInfo.name || visitInfo.citizen_name} - {visitInfo.reason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-6">
                Select Procedures <span className="text-sm font-normal text-gray-500">({selectedProcedures.length} selected)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {procedures.map((procedure) => (
                  <label key={procedure.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedProcedures.includes(procedure.id)}
                      onChange={() => toggleProcedure(procedure.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 group-hover:text-indigo-900">{procedure.name}</div>
                      <div className="text-sm text-gray-500">{procedure.description || 'Standard procedure'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || selectedProcedures.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Recording Procedures...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Record {selectedProcedures.length} Procedure{selectedProcedures.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProcedure;

