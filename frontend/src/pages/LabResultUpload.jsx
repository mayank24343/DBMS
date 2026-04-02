import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { FileText, ClipboardCheck, ArrowLeft, Save, TestTube } from 'lucide-react';

const LabResultUpload = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const facilityId = localStorage.getItem('facility_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    if (!facilityId || !orderId) {
      navigate('/facility-dashboard');
      return;
    }
    loadOrderDetails();
  }, [orderId, facilityId, navigate]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.getLabOrderDetails(orderId);
      setOrderDetails(data);
    } catch (err) {
      showMessage('error', 'Failed to load lab order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resultText.trim()) {
      showMessage('error', 'Enter result text');
      return;
    }

    setSaving(true);
    try {
      await facilityAPI.submitLabResult(orderId, resultText);
      showMessage('success', 'Lab result submitted successfully!');
      setTimeout(() => navigate('/pending-lab-orders'), 2000);
    } catch (err) {
      showMessage('error', 'Failed to submit result');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false }), 4000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <TestTube className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Lab Order Not Found</h2>
          <button 
            onClick={() => navigate('/pending-lab-orders')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Back to Pending Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/pending-lab-orders')}
            className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-lg transition-all font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Pending Orders
          </button>
          
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg mb-6">
                <TestTube className="w-5 h-5 mr-2" />
                Lab Result Upload
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">
                Order #{orderDetails.order_id}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{orderDetails.test}</div>
                  <div className="text-gray-500">Test Name</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{orderDetails.citizen_name}</div>
                  <div className="text-gray-500">Patient</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold">{orderDetails.date}</div>
                  <div className="text-gray-500">Order Date</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-4">
                  Lab Result
                </label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Enter detailed lab results here... (values, normal range, interpretation)"
                  rows="10"
                  className="w-full px-6 py-6 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-lg font-mono resize-vertical"
                  required
                />
              </div>

              <div className="flex gap-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/pending-lab-orders')}
                  className="flex-1 px-8 py-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <ArrowLeft className="w-6 h-6" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-8 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-6 h-6" />
                      Submit Result
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Toast */}
        {message.show && (
          <div className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-300 ${
            message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span className="font-bold">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultUpload;

