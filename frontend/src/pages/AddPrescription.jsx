import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pill, Plus, Save, Search, Trash2, Calendar } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AddPrescription = () => {
  const [visitId, setVisitId] = useState(useParams().visitId || '');
  const [items, setItems] = useState([]); // Available items from inventory
  const [prescription, setPrescription] = useState({ item_id: '', dosage: '', frequency: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null); const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const facilityId = localStorage.getItem('facility_id');
    try {
      const response = await api.get(`api/medicines/`);
      setItems(response.data);
      console.log(response.data);
    } catch (err) {
      console.error('Failed to fetch items');
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
      await api.post(`api/prescription/${visitId}/`, {
        item_id: prescription.item_id,dosage: prescription.dosage,frequency: prescription.frequency, start_date: prescription.start_date,end_date: prescription.end_date
      });
      setSuccess(true);
    } catch (err) {
      console.error('Prescription add failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Save className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Prescriptions Added!</h1>
          <p className="text-lg text-gray-600 mb-8">Prescription recorded successfully.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
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
      <div className="max-w-4xl mx-auto px-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg mb-6">
              <Pill className="w-5 h-5 mr-2" />
              Prescriptions
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
              Add Prescriptions
            </h1>
            <p className="text-xl text-gray-600">Prescribe medications for patient visit</p>
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
                  className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                  placeholder="Enter visit ID"
                  required
                />
                
              </div>
              {visitInfo && (
                <p className="mt-2 text-sm text-green-600 font-semibold">
                  Patient: {visitInfo.name} - {visitInfo.reason}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Prescription Details
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select 
                  value={prescription.item_id}
                  onChange={(e) => setPrescription({...prescription, item_id: e.target.value})}
                  className="px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                  required
                >
                  <option value="">Select Medication</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg)"
                  value={prescription.dosage}
                  onChange={(e) => setPrescription({...prescription, dosage: e.target.value})}
                  className="px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. TID)"
                  value={prescription.frequency}
                  onChange={(e) => setPrescription({...prescription, frequency: e.target.value})}
                  className="px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                  required
                />
              </div></div><div><label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" />Treatment Period</label><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">              <div>                   <label className="block text-xs text-gray-600 mb-1 font-medium">Start Date</label>                   <input                     type="date"                     value={prescription.start_date}                     onChange={(e) => setPrescription({...prescription, start_date: e.target.value})}                     className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"                     required                   />                 </div>                 <div>                   <label className="block text-xs text-gray-600 mb-1 font-medium">End Date</label>                   <input                     type="date"                     value={prescription.end_date}                     onChange={(e) => setPrescription({...prescription, end_date: e.target.value})}                     className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"                     required                   />                 </div>               </div>             </div>              <button 
              type="submit" 
              disabled={loading || !prescription.item_id || !prescription.dosage || !prescription.frequency || !prescription.start_date || !prescription.end_date}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save All Prescriptions
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPrescription;

