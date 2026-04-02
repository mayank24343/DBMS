import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Package, TrendingUp, Search, CheckCircle, DollarSign, Truck } from 'lucide-react';

const BestSupplier = () => {
  const facilityId = localStorage.getItem('facility_id');
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [requiredQty, setRequiredQty] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [message, setMessage] = useState({ show: false, type: '', text: '' });

  useEffect(() => {
    if (!facilityId) {
      navigate('/facility-dashboard');
      return;
    }
    loadItems();
  }, [facilityId, navigate]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.getAllItems();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      showMessage('error', 'Failed to load items');
      // Fallback to facility inventory
      const inv = await facilityAPI.fetchFullInventory(facilityId);
      const uniqueItems = Array.from(new Set(inv.map(i => i.id))).map(id => inv.find(i => i.id === id));
      setItems(uniqueItems);
      setFilteredItems(uniqueItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = items.filter(item => 
      item.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const fetchSuppliers = async () => {
    const qty = parseInt(requiredQty);
    if (!selectedItemId || qty <= 0) {
      showMessage('error', 'Select item and enter required quantity');
      return;
    }

    setLoadingSuppliers(true);
    try {
      const data = await facilityAPI.getBestSuppliers(selectedItemId, qty);
      setSuppliers(data);
      showMessage('success', `${data.length} suppliers ranked by price`);
    } catch (err) {
      showMessage('error', 'Failed to fetch suppliers');
      console.error(err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: '', text: '' }), 4000);
  };

  const selectedItem = items.find(item => item.id == selectedItemId);

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
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg mb-6">
            <DollarSign className="w-5 h-5 mr-2" />
            Best Suppliers
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-6">
            Find Cheapest Suppliers ({items.length} items)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select item & quantity to see suppliers ranked by price per unit. Ready to reorder?
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 max-w-2xl mx-auto mb-12">
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Item ({filteredItems.length})</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
              >
                <option value="">Choose item...</option>
                {filteredItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.item} (ID: {item.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Required Quantity</label>
              <input
                type="number"
                min="1"
                value={requiredQty}
                onChange={(e) => setRequiredQty(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg text-right font-mono"
                placeholder="Enter quantity needed"
              />
            </div>

            <button
              onClick={fetchSuppliers}
              disabled={!selectedItemId || !requiredQty || loadingSuppliers}
              className="w-full px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 justify-center"
            >
              {loadingSuppliers ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Fetching Suppliers...
                </>
              ) : (
                <>
                  <Truck className="w-6 h-6" />
                  Find Best Suppliers
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suppliers Table */}
        {suppliers.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                Top Suppliers for {selectedItem?.name || selectedItem?.item} (Qty: {requiredQty})
              </h3>
              <p className="text-emerald-700 mt-1 font-semibold">Ranked by lowest price per unit</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">#</th>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Supplier ID</th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Qty Available</th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Price/Unit</th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Total Cost</th>
                    <th className="px-8 py-6 text-center text-lg font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier, index) => {
                    const totalCost = supplier.price * parseInt(requiredQty);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-2xl text-emerald-600">
                          {index + 1}
                        </td>
                        <td className="px-8 py-6 font-mono font-bold text-gray-900">
                          #{supplier.supplier_id}
                        </td>
                        <td className="px-6 py-6 text-right font-mono">
                          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
                            {supplier.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right font-mono text-2xl font-bold text-gray-900">
                          Rs.{supplier.price}
                        </td>
                        <td className="px-6 py-6 text-right font-mono text-xl font-bold text-emerald-600">
                          Rs.{totalCost.toFixed(2)}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                            Order Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

export default BestSupplier;

