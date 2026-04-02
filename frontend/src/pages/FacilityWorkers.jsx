import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Users, Building2, Search, Filter, UserCheck, CheckCircle } from 'lucide-react';

const FacilityWorkers = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      const data = await facilityAPI.getAllFacilities();
      setFacilities(data);
    } catch (err) {
      showMessage('error', 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async (facId) => {
    setLoading(true);
    try {
      const data = await facilityAPI.getFacilityWorkers(facId);
      setWorkers(data);
    } catch (err) {
      showMessage('error', 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFacilityId) {
      loadWorkers(selectedFacilityId);
    } else {
      setWorkers([]);
    }
  }, [selectedFacilityId]);

  const filteredWorkers = workers.filter(worker =>
    worker.name?.toLowerCase().includes(search.toLowerCase())
  );

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: '', text: '' }), 4000);
  };

  if (loading && !facilities.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg mb-6">
            <Users className="w-5 h-5 mr-2" />
            Facility Workers
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-6">
            Manage Healthcare Workers ({facilities.length} facilities)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select facility to view current assigned workers
          </p>
        </div>

        {/* Facility Selection */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto mb-12 border border-gray-100">
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Facility</label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
              >
                <option value="">Choose facility...</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.type}) - ID: {fac.id}
                  </option>
                ))}
              </select>
            </div>

            {selectedFacilityId && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search workers by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Workers Table */}
        {workers.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-purple-600" />
                Workers at {facilities.find(f => f.id == selectedFacilityId)?.name} ({filteredWorkers.length} found)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Worker ID</th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Name</th>
                    <th className="px-6 py-6 text-center text-lg font-bold text-gray-900">Role</th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Qualifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWorkers.map((worker, index) => (
                    <tr key={worker.worker_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-mono font-bold text-gray-900">
                        #{worker.worker_id}
                      </td>
                      <td className="px-8 py-6 font-semibold text-gray-900">
                        {worker.name}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                          {worker.role}
                        </span>
                      </td>
                      
                      <td className="px-6 py-6 text-right">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                          {worker.skills[0] || 'No skills listed'} {worker.skills[1] || ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedFacilityId ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-gray-100">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No workers assigned</h3>
            <p className="text-gray-500 text-lg mb-8">This facility currently has no active workers.</p>
          </div>
        ) : null }

        {/* Message Toast */}
        {message.show && (
          <div className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right fade-in ${
            message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold">{message.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityWorkers;

