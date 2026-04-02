import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Package, Truck, DollarSign, CheckCircle, Search, ShoppingCart } from 'lucide-react';

const ManualBuy = () => {
  const facilityId = localStorage.getItem('facility_id');
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    item_id: '',
    supplier_id: '',
    quantity: '',
    facility_id: facilityId
  });
  const [message, setMessage] = useState({ show: false, type: '', text: '' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [searchSupplier, setSearchSupplier] = useState('');

  useEffect(() => {
    if (!facilityId) {
      navigate('/facility-dashboard');
      return;
    }
    loadData();
  }, [facilityId, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, suppliersData] = await Promise.all([
        facilityAPI.getAllItems(),
        // Load suppliers - assume API or from listings
        facilityAPI.getSuppliers() // Placeholder - add to api.js if needed
      ]);
      setItems(itemsData);
      setSuppliers(suppliersData);
    } catch (err) {
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    (item.name || item.item)?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_id || !formData.supplier_id || !formData.quantity) {
      showMessage('error', 'Fill all fields');
      return;
    }

    setPlacingOrder(true);
    try {
      await facilityAPI.manualPurchase(formData);
      showMessage('success', 'Order placed successfully!');
      setFormData({ item_id: '', supplier_id: '', quantity: '', facility_id });
    } catch (err) {
      showMessage('error', 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
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
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold text-lg shadow-lg mb-6">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Manual Purchase Order
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Place Order with Supplier
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Select item, supplier and quantity to place manual purchase order
          </p>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 mb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Item</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 mb-2"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={formData.item_id}
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                  required
                >
                  <option value="">Select Item</option>
                  {filteredItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.item} (ID: {item.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 mb-2"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
                  required
                >
                  <option value="">Select Supplier</option>
                  {filteredSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} (ID: {supplier.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg text-right font-mono"
                placeholder="Enter quantity"
                required
              />
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 justify-center"
            >
              {placingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  Place Manual Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Message */}
        {message.show && (
          <div className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right fade-in ${
            message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span className="font-bold">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualBuy;

