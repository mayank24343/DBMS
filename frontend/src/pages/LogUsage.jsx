import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Package, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

const LogUsage = () => {
  const facilityId = localStorage.getItem('facility_id');
  const navigate = useNavigate();
  
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Typing-based states
  const [typedId, setTypedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  // Refs for rapid keyboard entry
  const idInputRef = useRef(null);
  const qtyInputRef = useRef(null);

  useEffect(() => {
    if (!facilityId) {
      navigate('/facility-dashboard');
      return;
    }
    loadInventory();
  }, [facilityId, navigate]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.fetchFullInventory(facilityId);
      const safeData = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setInventory(safeData);
    } catch (err) {
      showMessage('error', 'Failed to load inventory');
    } finally {
      setLoading(false);
      // Auto-focus the ID input when the page loads
      setTimeout(() => idInputRef.current?.focus(), 100);
    }
  };

  // Find the item strictly based on what is typed
  const selectedItem = inventory.find(item => String(item.item_id) === String(typedId).trim());
  console.log(selectedItem)

  const handleIdChange = (e) => {
    const val = e.target.value;
    setTypedId(val);
    // Auto-set quantity to 1 if a valid item ID is recognized
    const itemExists = inventory.find(item => String(item.item_id) === String(val).trim());
    if (itemExists) {
      setQuantity('1');
    } else {
      setQuantity('');
    }
  };

  const handleLogUsage = async (e) => {
    if (e) e.preventDefault();
    const qtyToLog = Number(quantity);
    
    if (!selectedItem || qtyToLog < 1 || qtyToLog > selectedItem.quantity) {
      showMessage('error', `Invalid input. Check ID and ensure quantity is between 1 and ${selectedItem?.quantity || 0}`);
      return;
    }

    setSubmitting(true);
    try {
      console.log("hereee");
      console.log(selectedItem.item_id, qtyToLog);
      await facilityAPI.logUsage(selectedItem.item_id, facilityId, qtyToLog);
      showMessage('success', `Success: Logged ${qtyToLog} units of ${selectedItem.item || selectedItem.name}.`);
      
      // Reset for the next rapid entry
      setTypedId('');
      setQuantity('');
      await loadInventory();
      
      // Instantly bounce focus back to the ID field for the next item
      idInputRef.current?.focus();
    } catch (err) {
      showMessage('error', 'Failed to log usage. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Allow pressing "Enter" to submit quickly
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedItem && quantity) {
      handleLogUsage();
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: '', text: '' }), 3000);
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalItems = inventory.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg mb-6">
            <TrendingDown className="w-5 h-5 mr-2" />
            Rapid Data Entry
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-orange-900 bg-clip-text text-transparent mb-4">
            Type ID to Log Usage
          </h1>
          <p className="text-gray-500 text-lg">Use a keyboard or barcode scanner for fast entry.</p>
        </div>

        {/* Rapid Typing Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 max-w-2xl mx-auto mb-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Item ID</label>
              <input
                ref={idInputRef}
                type="text"
                value={typedId}
                onChange={handleIdChange}
                onKeyDown={(e) => e.key === 'Enter' && qtyInputRef.current?.focus()}
                className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-2xl font-mono tracking-widest"
                placeholder="Scan or type ID..."
                autoComplete="off"
              />
              
              {/* Live Validation Feedback */}
              {typedId.length > 0 && !selectedItem && (
                <div className="text-sm text-red-500 font-bold mt-3 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> No item found with this ID
                </div>
              )}
              {selectedItem && (
                <div className="text-sm text-emerald-600 font-bold mt-3 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Match: {selectedItem.item || selectedItem.name} (Stock: {selectedItem.quantity})
                </div>
              )}
            </div>
            
            {selectedItem && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Usage Quantity</label>
                <input
                  ref={qtyInputRef}
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-2xl font-mono"
                  placeholder="Enter quantity"
                />
                {Number(quantity) > selectedItem.quantity && (
                  <div className="text-sm text-red-500 font-bold mt-3">
                    Exceeds current stock limit of {selectedItem.quantity}.
                  </div>
                )}
                
                <button
                  onClick={handleLogUsage}
                  disabled={!quantity || Number(quantity) < 1 || Number(quantity) > selectedItem.quantity || submitting}
                  className="w-full mt-8 px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 justify-center"
                >
                  {submitting ? 'Logging...' : `Log ${quantity || ''} Units (Press Enter)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Read-Only Reference Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 opacity-90">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-6 h-6" />
              Inventory Reference ({totalItems} items)
            </h3>
            <p className="text-sm text-gray-500 mt-1">Look up IDs here. Table is read-only.</p>
          </div>
          
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider sticky top-0">
                <tr>
                  <th className="px-8 py-4 font-bold bg-gray-50">Item ID</th>
                  <th className="px-6 py-4 font-bold bg-gray-50">Item Name</th>
                  <th className="px-6 py-4 font-bold text-right bg-gray-50">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => (
                  <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-mono font-bold text-blue-600">
                      {item.item_id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.item || item.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Toast Message */}
        {message.show && (
          <div className={`fixed top-8 right-1/2 translate-x-1/2 z-50 px-8 py-4 rounded-full shadow-2xl transform transition-all animate-in slide-in-from-top-4 fade-in duration-300 ${
            message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span className="font-bold text-lg">{message.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogUsage;