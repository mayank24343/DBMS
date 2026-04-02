import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { TestTube, FileText, Search, Clock, ArrowRight } from 'lucide-react';

const PendingLabOrders = () => {
  const facilityId = localStorage.getItem('facility_id');
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    if (!facilityId) {
      navigate('/facility-dashboard');
      return;
    }
    loadOrders();
  }, [facilityId, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Assume API endpoint for facility lab orders
      const data = await facilityAPI.getPendingLabOrders(facilityId);
      setOrders(data);
    } catch (err) {
      showMessage('error', 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.test?.toLowerCase().includes(search.toLowerCase()) ||
    order.citizen_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewResult = (orderId) => {
    navigate(`/lab-result-upload/${orderId}`);
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false }), 4000);
  };

  if (loading) {
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
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg mb-6">
            <TestTube className="w-5 h-5 mr-2" />
            Pending Lab Orders
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-orange-900 bg-clip-text text-transparent mb-6">
            Lab Orders for Facility #{facilityId} ({filteredOrders.length})
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Review and complete pending lab tests assigned to your facility
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search by test name or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Order ID</th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Test</th>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900">Patient</th>
                    <th className="px-6 py-6 text-center text-lg font-bold text-gray-900">Order Date</th>
                    <th className="px-8 py-6 text-center text-lg font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-8 py-6 font-mono font-bold text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-8 py-6 font-semibold text-gray-900">
                        {order.test}
                      </td>
                      <td className="px-6 py-6 text-gray-900">
                        {order.citizen_name} (ID: {order.citizen_id})
                      </td>
                      <td className="px-6 py-6 text-center font-mono text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => handleViewResult(order.order_id)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          Write Result
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-gray-100">
            <TestTube className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No pending lab orders</h3>
            <p className="text-gray-500 text-lg">All lab tests for this facility are up to date.</p>
          </div>
        )}

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

export default PendingLabOrders;

