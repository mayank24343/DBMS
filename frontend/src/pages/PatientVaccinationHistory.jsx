import React, { useEffect, useState } from 'react';
import { citizenAPI } from '../services/api';
import { Syringe, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';

const PatientVaccinationHistory = () => {
    const citizenId = useParams().citizenId;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        citizenAPI.vaccinationHistory(citizenId)
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [citizenId]);

    if (loading) {
        return <div className="text-center mt-10">Loading vaccinations...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Patient Vaccination History</h1>

            {data.length === 0 ? (
                <div>No vaccination records found.</div>
            ) : (
                <div className="space-y-4">
                    {data.map((v, i) => (
                        <div key={i} className="p-5 border rounded-xl shadow-sm bg-white">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 font-bold">
                                    <Syringe className="w-5 h-5 text-green-600" />
                                    {v.vaccine}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {v.date}
                                </div>
                            </div>

                            <div className="mt-2 text-sm text-gray-600">
                                Dose: {v.dose}
                            </div>

                            <div className="text-sm text-gray-500">
                                Center: {v.centre}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientVaccinationHistory;