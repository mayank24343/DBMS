import React, { useEffect, useState } from 'react';
import { facilityAPI } from '../services/api';
import { Package, AlertCircle, Clock, ShoppingCart, Filter } from 'lucide-react';

const FacilityInventory = () => {
  const facilityId = localStorage.getItem('facility_id');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  useEffect(() => {
    if (facilityId) {
      loadInventory();
    }
  }, [facilityId]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.fetchFullInventory(facilityId);
      setInventory(data);
      setFilteredInventory(data);
    } catch (err) {
      console.error('Inventory load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = inventory;

    // Search filter
    if (search) {
      result = result.filter(item => 
        item.item.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === 'low-stock') {
      result = result.filter(item => item.quantity < item.threshold);
    } else if (activeTab === 'expired') {
      result = result.filter(item => new Date(item.expiry) < new Date());
    }

    setFilteredInventory(result);
  }, [search, activeTab, inventory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const expiredItems = inventory.filter(item => new Date(item.expiry) < new Date());
  const lowStockItems = inventory.filter(item => item.quantity < item.threshold);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg mb-6">
            <Package className="w-5 h-5 mr-2" />
            Inventory Management
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Facility Inventory ({inventory.length} items)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track stock levels, expiry dates, and reorder essentials
          </p>
        </div>

        {/* Alert Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-8 rounded-3xl shadow-2xl flex items-center gap-4">
              <AlertCircle className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">{expiredItems.length} Items Near Expiry</h3>
                
              </div>
            </div>
          
          
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-8 rounded-3xl shadow-2xl flex items-center gap-4">
              <AlertCircle className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">{lowStockItems.length} Low Stock</h3>
                
              </div>
            </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-2xl flex items-center gap-4">
            <Package className="w-12 h-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-2">{inventory.length}</h3>
              <p className="opacity-90">Total Items Tracked</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search items by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
              />
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2 lg:gap-0 lg:flex-0">
              {['all', 'low-stock', 'expired'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' && 'All Items'}
                  {tab === 'low-stock' && (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Low Stock
                    </>
                  )}
                  {tab === 'expired' && (
                    <>
                      <Clock className="w-4 h-4" />
                      Expired
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-lg font-bold text-gray-900">Item</th>
                  <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Quantity</th>
                  <th className="px-6 py-6 text-right text-lg font-bold text-gray-900">Threshold</th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-900">Status</th>
                  <th className="px-6 py-6 text-center text-lg font-bold text-gray-900">Expiry</th>
                  <th className="px-8 py-6 text-right text-lg font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const expiryDate = new Date(item.expiry);
                  const isExpired = expiryDate < new Date();
                  const isLowStock = item.quantity < item.threshold;
                  
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors group/item`}>
                      <td className="px-8 py-6 font-semibold text-gray-900 max-w-md truncate">
                        {item.item}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          isLowStock ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right font-mono text-sm text-gray-500">
                        {item.threshold}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isLowStock 
                            ? 'bg-orange-200 text-orange-900' 
                            : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {isLowStock ? 'LOW STOCK' : 'OK'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isExpired 
                            ? 'bg-red-200 text-red-900 animate-pulse' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          {expiryDate.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                            Reorder
                          </button>
                          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                            Log Usage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* No Results */}
          {filteredInventory.length === 0 && (
            <div className="text-center py-24 border-t border-gray-200">
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No items found</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Try adjusting your search or filter settings
              </p>
            </div>
          )}
        </div>

        {/* Reorder Summary */}
        
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <AlertCircle className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl font-bold">Low Stock Alert</h3>
                    <p className="opacity-90">{lowStockItems.length} items need reordering</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {lowStockItems.slice(0, 6).map(item => (
                    <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="font-bold text-lg">{item.quantity}/{item.threshold}</div>
                      <div className="text-sm opacity-90">{item.item}</div>
                    </div>
                  ))}
                </div>
              </div>
            
            
              <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <Clock className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl font-bold">Items Near or Over Expiry</h3>
                    <p className="opacity-90">{expiredItems.length} items</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {expiredItems.slice(0, 6).map(item => (
                    <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <div className="text-sm opacity-90">{item.item}</div>
                    </div>
                  ))}
                </div>
              </div>
            
          </div>
        
      </div>
    </div>
  );
};

export default FacilityInventory;

