import React, { useState, useEffect } from 'react';
import { citizenAPI } from '../services/api';
import { Search, Filter, MapPin, Stethoscope, Pill, TestTube, FlaskConical, Activity } from 'lucide-react';

import { Link } from 'react-router-dom';


const ServiceDirectory = () => {
    const [searchType, setSearchType] = useState('lab');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        const data = await citizenAPI.searchDirectory(searchType, searchQuery);
        setResults(data);
        setHasSearched(true);
        setIsSearching(false);
    };

    useEffect(() => {
        // Clear results when changing search type
        setResults([]);
        setHasSearched(false);
        setSearchQuery('');
    }, [searchType]);

    return (
        <div className="max-w-5xl mx-auto p-6 mt-4">
            
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">National Health Directory</h1>
                <p className="text-lg text-gray-500 font-medium">Find labs, pharmacies, and specialized procedures near you.</p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-10">
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button 
                        onClick={() => setSearchType('lab')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${searchType === 'lab' ? 'bg-white text-purple-700 border-b-2 border-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FlaskConical className="w-5 h-5" /> Lab Tests
                    </button>
                    <button 
                        onClick={() => setSearchType('medicine')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${searchType === 'medicine' ? 'bg-white text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Pill className="w-5 h-5" /> Medicines & Vaccines
                    </button>
                    <button 
                        onClick={() => setSearchType('procedure')}
                        className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${searchType === 'procedure' ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Activity className="w-5 h-5" /> Procedures
                    </button>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSearch} className="p-6 flex gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                searchType === 'lab' ? 'e.g., Blood Panel, MRI, X-Ray...' :
                                searchType === 'pharmacy' ? 'e.g., Amoxicillin, Paracetamol...' :
                                'e.g., Appendectomy, Dialysis...'
                            }
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSearching}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all whitespace-nowrap"
                    >
                        {isSearching ? 'Searching...' : 'Search Network'}
                    </button>
                </form>
            </div>

            {/* Results Grid */}
            {hasSearched && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Search Results ({results.length})</h2>
                    
                    {results.length === 0 ? (
                        <div className="bg-gray-50 p-10 rounded-2xl text-center border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No facilities found offering "{searchQuery}" in your area.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((facility) => (
                                <div key={facility.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{facility.name}</h3>
                                            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded mt-1">
                                                {facility.type}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                            {facility.city}, {facility.state}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-green-600 mb-6">
                                        <p className="flex items-center gap-2"> Provides {facility.thing}</p>
                  
                                    </div>

                                    {/* Action Button */}
                                    <Link 
                                        to={`/book/appointment`} // Using the hardcoded citizen ID for demo purposes
                                        className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2.5 rounded-lg transition-colors"
                                    >
                                        Book Service Here
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceDirectory;