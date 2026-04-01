import React, { useEffect, useState } from 'react';
import { citizenAPI } from '../services/api';
import { Syringe, AlertCircle } from 'lucide-react';

const EligibleVaccines = ({ citizenId }) => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    citizenAPI.eligibleVaccines(citizenId)
      .then(data => {
        setVaccines(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load eligible vaccines');
        setLoading(false);
      });
  }, [citizenId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Syringe className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Eligible Vaccines</h1>
      </div>

      {vaccines.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <AlertCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Up to date!</h3>
          <p className="text-green-700">You are current on all recommended vaccines.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaccines.map((vaccine) => (
            <div key={vaccine.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <h3 className="font-bold text-lg text-gray-900 mb-3">{vaccine.name}</h3>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors" >
                Schedule Vaccination
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EligibleVaccines;
