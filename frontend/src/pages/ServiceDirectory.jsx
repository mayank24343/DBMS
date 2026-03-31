import React, { useState, useEffect } from 'react';
import { citizenAPI } from '../services/api';
import { Search, Filter, MapPin, Stethoscope, Pill, TestTube } from 'lucide-react';

const ServiceDirectory = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('lab');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const types = [
    { value: 'lab', label: 'Labs', icon: TestTube },
    { value: 'pharmacy', label: 'Pharmacies', icon: Pill },
    { value: 'procedure', label: 'Procedures', icon: Stethoscope }
  ];

  const search = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await citizenAPI.searchDirectory(type, query);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(search, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [query, type]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Find Healthcare Services
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Search for labs, pharmacies, or procedures near you
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto mb-12">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for hospitals, labs, pharmacies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          >
            {types.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Searching...</p>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((facility) => (
            <div key={facility.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{facility.name}</h3>
                  <p className="text-gray-600">{facility.type}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{facility.address}</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      ) : query.length > 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
          <p className="text-gray-500 max-w-md mx-auto">Try a different search term or service type</p>
        </div>
      )}
    </div>
  );
};

export default ServiceDirectory;
