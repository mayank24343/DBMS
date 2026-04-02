import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Package, AlertCircle, Search, CheckCircle, TrendingDown, Filter } from 'lucide-react';

const LogUsage = () => {
  const facilityId = localStorage.getItem('facility_id');
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Keep ID as a string to avoid JavaScript Number/NaN quirks
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    if (!facilityId) {
      navigate('/facility-dashboard');
      return;
    }
    loadInventory();
  }, [facilityId, navigate]);

  const loadInventory = async (tab = 'all') => {
    setLoading(true);
    try {
      let data;
      if (tab === 'low-stock') {
        data = await facilityAPI.fetchLowStock(facilityId);
      } else {
        data = await facilityAPI.fetchFullInventory(facilityId);
      }
      
      // Ensure we always have an array
      const safeData = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setInventory(safeData);
      setFilteredInventory(safeData);
    } catch (err) {
      showMessage('error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim()) {
      setFilteredInventory(inventory.filter(item => 
        (item.item || item.name || '').toLowerCase().includes(search.toLowerCase())
      ));
    } else {
      setFilteredInventory(inventory);
    }
  }, [search, inventory]);

  useEffect(() => {
    loadInventory(activeTab);
  }, [activeTab]);

  // FIX: Safe, strict string comparison regardless of whether API sends string or int
  const selectedItem = inventory.find(item => String(item.id) === String(selectedItemId));

  const handleLogUsage = async () => {
    const qtyToLog = Number(quantity);
    
    if (!selectedItem || qtyToLog < 1 || qtyToLog > selectedItem.quantity) {
      showMessage('error', `Invalid selection. Quantity must be between 1 and ${selectedItem?.quantity || 0}`);
      return;
    }

    setSubmitting(true);
    try {
      await facilityAPI.logUsage(selectedItem.id, facilityId, qtyToLog);
      showMessage('success', `Logged ${qtyToLog} units. Stock updated.`);
      setSelectedItemId('');
      setQuantity('');
      loadInventory(activeTab);
    } catch (err) {
      showMessage('error', 'Failed to log usage. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: '', text: '' }), 4000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity < (item.threshold || 0)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg mb-6">
            <TrendingDown className="w-5 h-5 mr-2" />
            Log Item Usage
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-orange-900 bg-clip-text text-transparent mb-6">
            Track Inventory Usage ({totalItems} items)
          </h1>
        </div>

        {/* Single Item Usage Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Log Usage for One Item</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Item</label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedItemId(val);
                  setQuantity(val ? '1' : ''); // Set to '1' naturally if an item is picked
                }}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-lg"
              >
                <option value="">Choose an item...</option>
                {filteredInventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item || item.name} (Stock: {item.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedItem && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Stock</label>
                    <div className="p-4 bg-emerald-100 rounded-xl text-lg font-bold text-emerald-800">
                      {selectedItem.quantity}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Threshold</label>
                    <div className="p-4 bg-gray-100 rounded-xl text-lg font-mono">
                      {selectedItem.threshold || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Usage Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={quantity}
                    // FIX: Allows empty string so backspacing doesn't force a '0'
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-lg text-right font-mono"
                    placeholder="Enter quantity"
                  />
                  {Number(quantity) > selectedItem.quantity && (
                    <div className="text-sm text-red-500 font-bold mt-2">
                      Cannot exceed current stock of {selectedItem.quantity}.
                    </div>
                  )}
                </div>
              </>
            )}
            
            <button
              onClick={handleLogUsage}
              disabled={
                !selectedItem || 
                !quantity || 
                Number(quantity) < 1 || 
                Number(quantity) > selectedItem.quantity || 
                submitting
              }
              className="w-full px-8 py-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 justify-center"
            >
              {submitting ? 'Logging Usage...' : `Log ${quantity || ''} Units`}
            </button>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8" />
              Available Items
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-8 py-4 font-bold">Item Name</th>
                  <th className="px-6 py-4 font-bold text-right">Current Stock</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => {
                    setSelectedItemId(String(item.id));
                    setQuantity('1');
                  }}>
                    <td className="px-8 py-6 font-semibold text-gray-900 group-hover:font-black">
                      {item.item || item.name}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {String(item.id) === selectedItemId ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Selected
                        </div>
                      ) : (
                        <span className="opacity-60 text-sm">Click to select</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Message */}
        {message.show && (
          <div className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl transform transition-all ${
            message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span className="font-bold">{message.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogUsage;