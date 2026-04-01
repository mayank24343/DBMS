import React, { useEffect, useState } from 'react';
import { facilityAPI } from '../services/api';
import { Hospital, Bed, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacilityWards = () => {
  const facilityId = localStorage.getItem('facility_id');
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (facilityId) {
      loadWards();
    }
  }, [facilityId]);

  const loadWards = async () => {
    setLoading(true);
    try {
      const data = await facilityAPI.getWardAvailability(facilityId);
      setWards(data);
    } catch (err) {
      setError('Failed to load wards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-bold">
        {error}
      </div>
    );
  }

  const totalBeds = wards.reduce((sum, ward) => sum + ward.total, 0);
  const occupiedBeds = wards.reduce((sum, ward) => sum + ward.occupied, 0);
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg shadow-lg mb-6">
            <Hospital className="w-5 h-5 mr-2" />
            Ward Management
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 bg-clip-text text-transparent mb-6">
            Facility Wards Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real-time capacity and occupancy for all wards
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="text-4xl font-black text-gray-900 mb-2">{totalBeds}</div>
            <div className="text-lg text-gray-600 mb-1">Total Beds</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="text-4xl font-black text-red-600 mb-2">{occupiedBeds}</div>
            <div className="text-lg text-gray-600 mb-1">Occupied</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="text-4xl font-black text-green-600 mb-2">{vacantBeds}</div>
            <div className="text-lg text-gray-600 mb-1">Available</div>
          </div>
        </div>

        {/* Occupancy Progress */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Occupancy Rate
            </h2>
            <div className="text-3xl font-black text-gray-900">
              {occupancyRate}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className={`h-6 rounded-full transition-all duration-1000 ${
                occupancyRate < 70 ? 'bg-green-500' : 
                occupancyRate < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{width: `${occupancyRate}%`}}
            ></div>
          </div>
        </div>

        {/* Wards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wards.map((ward) => (
            <Link key={ward.id} to={`/facility-admitted/`}>
            <div key={ward.id} className={`p-8 rounded-3xl shadow-lg border transition-all hover:shadow-xl hover:-translate-y-2 group ${
              ward.available > 0 
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
            }`}>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    ward.available > 0 ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <Bed className={`w-7 h-7 ${
                      ward.available > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl capitalize">{ward.type}</h3>
                    <p className="text-sm text-gray-600">Ward {ward.id}</p>
                  </div>
                </div>
                
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Occupied:</span>
                  <span className="font-bold text-gray-900">{ward.occupied}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total:</span>
                  <span className="font-bold text-gray-900">{ward.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{width: `${Math.round((ward.occupied / ward.total) * 100)}%`}}
                  ></div>
                </div>
              </div>

              <div className={`text-center py-3 px-6 rounded-xl font-bold text-sm transition-all ${
                ward.available > 0 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                  : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 cursor-not-allowed'
              }`}>
                {ward.available > 0 ? `+${ward.available} beds available` : 'No beds available'}
              </div>
            </div>
            </Link>
          ))}
        </div>

        {wards.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300">
            <Bed className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No wards configured</h3>
            <p className="text-gray-500 max-w-md mx-auto">Contact administration to set up ward configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityWards;

