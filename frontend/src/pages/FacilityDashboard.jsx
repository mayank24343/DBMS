import React, { useEffect, useState } from 'react';
import { facilityAPI } from '../services/api';
import { Hospital, Users, TrendingUp, ClipboardList, Syringe, FileText, ShoppingCart, AlertCircle, Calendar, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacilityDashboard = () => {
  const [occupancy, setOccupancy] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);
  const [loading, setLoading] = useState(true);
  const facilityId = localStorage.getItem('facility_id');
  const [facility, setFacility] = useState({});
  console.log('Loaded Facility ID:', facilityId);
  useEffect(() => {
    if (facilityId) {
      loadDashboardData();
    }
  }, [facilityId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Facility details
      const facilityData = await facilityAPI.getFacility(facilityId);
      setFacility(facilityData);
      
      // Occupancy
      const occData = await facilityAPI.fetchOccupancy(facilityId);
      setOccupancy(occData);
      
      // Today's appointments
      const appts = await facilityAPI.fetchAppointments(facilityId);
      setAppointments(appts);
      
      // Inventory alerts
      const low = await facilityAPI.fetchLowStock(facilityId);
      setLowStock(low);
      
      const expiry = await facilityAPI.fetchNearExpiry(facilityId);
      setNearExpiry(expiry);
      console.log(expiry);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock API calls - replace with real endpoints
  
  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Facility Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Hospital className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {facility.name || 'Facility Dashboard'}
                </h1>
                <p className="text-xl text-gray-600">ID: {facilityId} • {facility.type || 'Hospital'} • {facility.city || 'N/A'} • {facility.state || 'N/A'}</p>
            
              </div>
            </div>
          </div>

          
        </div>

        {/* Stats Grid */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to ="/wards">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Occupancy</p>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900">{occupancy?.occupied || 0}/{occupancy?.total_beds || 0}</div>
            <div className="text-green-600 font-bold text-xl">{occupancy?.vacant || 0} beds available</div>
          </div>
          </Link>

          <Link to="/facility-appointments">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Today's Appointments</p>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900">{appointments.length}</div>
            <div className="text-blue-600 font-bold text-xl">Patients scheduled</div>
          </div>
          </Link>

          <Link to="/inventory">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Low Stock Items</p>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900">{lowStock.length}</div>
            <div className="text-orange-600 font-bold text-xl">Needs reordering</div>
          </div>
          </Link>

          <Link to="/inventory">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-100 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Expiring Soon</p>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900">{nearExpiry.length}</div>
            <div className="text-yellow-600 font-bold text-xl">Check inventory</div>
          </div>
          </Link>
        </div>
        

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link to="/new-visit">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all cursor-pointer group" onClick={() => setShowCreateVisit(true)}>
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Create New Visit</h3>
            <p className="opacity-90">Register new patient visit</p>
          </div>
          </Link>
          
          <Link to="/current-patients/">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all cursor-pointer group">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Create Diagnosis</h3>
            <p className="opacity-90">Add diagnosis, prescribe meds & tests</p>
          </div>
          </Link>
          
          <Link to="/current-patients/">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all cursor-pointer group">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Admit/Discharge</h3>
            <p className="opacity-90">Patient admissions & ward management</p>
          </div>
          </Link>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all cursor-pointer group">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Place Orders</h3>
            <p className="opacity-90">Order from suppliers & warehouses</p>
          </div>
        </div>

        

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments Table */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Today's Appointments
            </h2>
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No appointments scheduled today
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appt) => (
                  <div key={appt.visit_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-bold text-gray-900">{appt.name}</div>
                      <div className="text-sm text-gray-600">{appt.reason}</div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      {appt.visit_id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              Low Stock Alerts
            </h2>
            {lowStock.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                All stock levels good
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div>
                      <div className="font-bold">{item.item}</div>
                      <div className="text-sm text-orange-800">Qty: {item.quantity}/{item.threshold}</div>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDashboard;
