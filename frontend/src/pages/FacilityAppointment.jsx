import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilityAPI } from '../services/api';
import { Activity, Hospital, Calendar, ChevronRight } from 'lucide-react';

const FacilityAppointment = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const facilityId = localStorage.getItem('facility_id');

    useEffect(() => {
        facilityAPI.currentAppointments(facilityId)
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch history:", err);
                setLoading(false);
            });
    }, [facilityId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 font-medium animate-pulse">
                Fetching medical records...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Activity className="text-blue-600 w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Appointments Today</h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">Facility ID: {facilityId}</p>
                    </div>
                </div>
                
            </div>

            {/* Content Section */}
            {history.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-500 border-2 border-dashed border-gray-300">
                    No appointments found for today.
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((visit) => (
                        <Link 
                            to={`/visit/${visit.visit_id}`} 
                            key={visit.visit_id} 
                            className="block group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 relative pr-12"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    <Hospital className="w-5 h-5 text-blue-500" />
                                    {visit.facility || visit.facility_name || 'Facility'}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    {visit.visit_date}
                                </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4 ml-7 text-sm leading-relaxed">
                                <span className="font-semibold text-gray-900">Reason:</span> {visit.reason}
                            </p>
                            
                            {/* Diagnosis Badges */}
                            {(visit.diagnoses || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 ml-7">
                                    {visit.diagnoses.map((d, idx) => (
                                        <span 
                                            key={idx} 
                                            className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-md tracking-wide"
                                        >
                                            {d.disease || d.disease_name || 'Diagnosis'}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Visual indicator that this is a button */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacilityAppointment;
