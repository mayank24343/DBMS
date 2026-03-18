import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVisitDetails } from '../services/api';
import { ArrowLeft, Stethoscope, Pill, FlaskConical, Bed, MapPin, Calendar, FileText } from 'lucide-react';

const VisitDetails = () => {
    const { visitId } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVisitDetails(visitId)
            .then(data => {
                setDetails(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching visit details:", err);
                setLoading(false);
            });
    }, [visitId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-blue-500 font-medium animate-pulse">
                Loading clinical data...
            </div>
        );
    }

    if (!details) {
        return <div className="text-center mt-10 text-red-500 font-bold">Failed to load visit details.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Back Navigation */}
            <Link 
                to=".." 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Medical History
            </Link>

            {/* Top Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Clinical Visit Record</h1>
                        <div className="flex items-center gap-4 text-blue-100 text-sm font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {details.visit_date}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {details.facility_name}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 bg-white/10 p-4 rounded-xl border border-white/20">
                    <p className="flex items-start gap-2 text-blue-50">
                        <FileText className="w-5 h-5 shrink-0 mt-0.5 text-blue-200" />
                        <span className="leading-relaxed"><strong className="text-white">Chief Complaint:</strong> {details.reason}</span>
                    </p>
                </div>
            </div>

            {/* 2-Column Grid for Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Diagnoses Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                        <Stethoscope className="text-red-500 w-6 h-6" /> Diagnoses
                    </h2>
                    {details.diagnoses?.length > 0 ? (
                        <ul className="space-y-3">
                            {details.diagnoses.map((d, idx) => (
                                <li key={idx} className="bg-red-50 border border-red-100 p-3 rounded-lg">
                                    <span className="block font-bold text-red-700">{d.disease_name}</span>
                                    {d.description && <span className="text-sm text-red-600 mt-1 block">{d.description}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No diagnoses recorded for this visit.</p>
                    )}
                </div>

                {/* Admissions Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                        <Bed className="text-indigo-500 w-6 h-6" /> Admission Status
                    </h2>
                    {details.admission ? (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                            <p className="font-semibold text-indigo-900 mb-2">Admitted to {details.admission.ward_type} Ward</p>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                    <span className="block text-indigo-400 text-xs uppercase tracking-wider font-bold">Admitted</span>
                                    <span className="font-medium text-indigo-800">{details.admission.admission_date}</span>
                                </div>
                                <div>
                                    <span className="block text-indigo-400 text-xs uppercase tracking-wider font-bold">Discharged</span>
                                    <span className="font-medium text-indigo-800">
                                        {details.admission.discharge_date || <span className="text-amber-600 font-bold">Currently Admitted</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Outpatient visit. No admission required.</p>
                    )}
                </div>

                {/* Prescriptions Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                        <Pill className="text-emerald-500 w-6 h-6" /> Prescriptions & Medications
                    </h2>
                    {details.prescriptions?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {details.prescriptions.map((p, idx) => (
                                <div key={idx} className="flex gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                    <div className="bg-white p-2 rounded-full h-fit shadow-sm">
                                        <Pill className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900">{p.item_name}</h3>
                                        <p className="text-sm font-medium text-emerald-700 mt-0.5">{p.dosage} — {p.frequency}</p>
                                        <p className="text-xs text-emerald-600 mt-2 bg-white/60 p-2 rounded-md">{p.instruction}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No medications prescribed.</p>
                    )}
                </div>

                {/* Lab Results Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                        <FlaskConical className="text-purple-500 w-6 h-6" /> Laboratory Orders
                    </h2>
                    {details.lab_results?.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {details.lab_results.map((l, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{l.test_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.order_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${l.result ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                                                    {l.result || "Pending Analysis"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No laboratory tests ordered.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VisitDetails;