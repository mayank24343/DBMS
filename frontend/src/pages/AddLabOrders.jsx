import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Save, Search, Beaker } from 'lucide-react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

const AddLabOrders = () => {
  const { visitId } = useParams();
  const [labTests, setLabTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [facilitiesForTest, setFacilitiesForTest] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [success, setSuccess] = useState(false);
  const [visitInfo, setVisitInfo] = useState(null);

  useEffect(() => {
    fetchLabTests();
    fetchVisitInfo();
  }, []);

  const fetchLabTests = async () => {
    try {
      const response = await api.get('api/lab-tests/');
      setLabTests(response.data);
    } catch (err) {
      console.error('Failed to fetch lab tests');
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

  const fetchFacilitiesForTest = async (testName) => {
    if (!testName) return;
    setFacilityLoading(true);
    try {
      const response = await api.get('api/search/', {
        params: { type: 'lab', query: testName }
      });
      setFacilitiesForTest(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities for test');
      setFacilitiesForTest([]);
    } finally {
      setFacilityLoading(false);
    }
  };

  const handleTestChange = async (e) => {
    const testId = e.target.value;
    setSelectedTestId(testId);
    setSelectedFacilityId('');
    const selectedTest = labTests.find(test => test.id == testId);
    if (selectedTest) {
      await fetchFacilitiesForTest(selectedTest.name);
    } else {
      setFacilitiesForTest([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`api/lab-order/${visitId}/`, {
        test_id: parseInt(selectedTestId),
        lab_id: parseInt(selectedFacilityId)
      });
      setSuccess(true);
      // Reset form
      setSelectedTestId('');
      setSelectedFacilityId('');
      setDescription('');
      setFacilitiesForTest([]);
    } catch (err) {
      console.error('Lab order creation failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Save className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Lab Order Created!</h1>
          <p className="text-lg text-gray-600 mb-8">Lab test order successfully added to the visit record.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all w-full mb-4"
          >
            Add Another Lab Order
          </button>
          <button className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-semibold" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Back to Visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <button 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg shadow-lg mb-6">
              <Beaker className="w-5 h-5 mr-2" />
              Lab Orders
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Add Lab Test Order
            </h1>
            <p className="text-xl text-gray-600">Order lab test for patient visit (Visit ID: <span className="font-bold text-purple-700">{visitId}</span>)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Visit Info */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-100">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Visit Information
              </label>
              {visitInfo ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-900">Patient: {visitInfo.citizen_name || visitInfo.name}</p>
                  <p className="text-gray-600">Reason: {visitInfo.reason}</p>
                  <p className="text-gray-600">Facility: {visitInfo.facility_name || visitInfo.facility}</p>
                  <p className="text-sm text-purple-700 font-medium">ID: {visitId}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Loading visit details...</p>
              )}
            </div>

            {/* Lab Test Select */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                Select Lab Test (One at a time)
              </label>
              <select 
                value={selectedTestId}
                onChange={handleTestChange}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
                required
              >
                <option value="">Choose a lab test</option>
                {labTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Facilities for Test */}
            {facilitiesForTest.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Facilities Providing This Test ({facilitiesForTest.length} found) - Select for Order
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto mb-6 pr-2">
                  {facilitiesForTest.map((fac) => (
                    <div key={fac.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl cursor-pointer hover:shadow-md transition-all">
                      <div className="font-semibold text-gray-900">{fac.name}</div>
                      <div className="text-sm text-gray-600">{fac.city}, {fac.state}</div>
                      <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full inline-block mt-1">{fac.type}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Order Facility
                  </label>
                  <select 
                    value={selectedFacilityId}
                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
                    required
                  >
                    <option value="">Select facility for lab order</option>
                    {facilitiesForTest.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.city}, {fac.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {facilityLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Searching facilities...</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Instructions / Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-vertical text-lg h-32"
                placeholder="Special instructions, urgency, preparation notes..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedTestId || !selectedFacilityId}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-8 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Creating Lab Order...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Create Lab Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLabOrders;

