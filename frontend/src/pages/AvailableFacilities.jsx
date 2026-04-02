import React, { useState, useEffect } from 'react';
import { MapPin, Building, Bed, AlertCircle, Search, LayoutGrid } from 'lucide-react';

const AvailableFacilities = () => {
  const [filterMode, setFilterMode] = useState('state'); // 'state' or 'city'
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch the dropdown options whenever the filter mode (State/City) changes
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      setError('');
      setSelectedRegion(''); // Reset selection when switching modes
      setFacilities([]);     // Clear table

      try {
        // Replace with your actual Django API endpoints
        const endpoint = filterMode === 'state' 
          ? 'http://127.0.0.1:8000/api/states/' 
          : 'http://127.0.0.1:8000/api/cities/';
          
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch regions');
        
        const data = await response.json();
        setRegionOptions(data);
      } catch (err) {
        console.error(err);
        setError(`Could not load ${filterMode} list. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [filterMode]);

  // 2. Fetch the facilities when a specific State/City is chosen from the dropdown
  useEffect(() => {
    if (!selectedRegion) {
      setFacilities([]);
      return;
    }

    const fetchFacilities = async () => {
      setLoading(true);
      setError('');

      try {
        // Replace with your actual Django API endpoints
        const endpoint = filterMode === 'state'
          ? `http://127.0.0.1:8000/api/facilities/available/state/?state=${encodeURIComponent(selectedRegion)}`
          : `http://127.0.0.1:8000/api/facilities/available/city/?city=${encodeURIComponent(selectedRegion)}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch facilities');
        
        const data = await response.json();
        setFacilities(data);
      } catch (err) {
        setError('Could not load facility data for this region.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [selectedRegion, filterMode]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Regional Bed Availability
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor vacant beds across different states and cities in real-time.
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            
            {/* Toggle Switch */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Filter By</label>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-sm">
                <button
                  onClick={() => setFilterMode('state')}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                    filterMode === 'state' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> State
                </button>
                <button
                  onClick={() => setFilterMode('city')}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                    filterMode === 'city' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building className="w-4 h-4" /> City
                </button>
              </div>
            </div>

            {/* Dropdown Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                Select {filterMode === 'state' ? 'State' : 'City'}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={loading && !regionOptions.length}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg appearance-none font-medium text-gray-800 disabled:opacity-50"
              >
                <option value="">-- Choose a {filterMode} --</option>
                {regionOptions.map((region, idx) => (
                  <option key={idx} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-bold border border-red-100">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" />
              Available Facilities {selectedRegion && `in ${selectedRegion}`}
            </h3>
            {facilities.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-sm">
                {facilities.length} Found
              </span>
            )}
          </div>

          {loading && selectedRegion ? (
            <div className="p-24 flex flex-col items-center justify-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="font-medium">Loading facility data...</p>
            </div>
          ) : !selectedRegion ? (
            <div className="p-24 text-center text-gray-400">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a {filterMode} to view facilities</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="p-24 text-center text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-600 mb-2">No facilities found</p>
              <p>There are no facilities with vacant beds in {selectedRegion}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-8 py-4 font-bold w-24">ID</th>
                    <th className="px-6 py-4 font-bold">Facility Name</th>
                    <th className="px-8 py-4 font-bold text-right">Vacant Beds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {facilities.map((facility) => (
                    <tr key={facility.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-8 py-5 text-gray-500 font-mono text-sm">
                        #{facility.id}
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900">
                        {facility.name}
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900">
                        {facility.city}, {facility.state}
                      </td>
                
                      <td className="px-8 py-5 text-right">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-emerald-100 text-emerald-800">
                          {facility.vacant_beds}
                          <Bed className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AvailableFacilities;