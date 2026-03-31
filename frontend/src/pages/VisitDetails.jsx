import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { citizenAPI } from '../services/api';
import { Hospital, Calendar, Stethoscope, Pill, TestTube, ClipboardList } from 'lucide-react';

const VisitDetails = () => {
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    citizenAPI.visitDetail(visitId)
      .then(data => {
        setVisit(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load visit details');
        setLoading(false);
      });
  }, [visitId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-white/20 rounded-2xl">
            <Hospital className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Visit Summary</h1>
            <p className="text-xl opacity-90">Visit ID: #{visitId}</p>
          </div>
        </div>
      </div>

      {/* Visit Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-lg">Visit Date</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{visit.visit_date}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Hospital className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-lg">Facility</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">{visit.facility}</p>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-200 rounded-xl">
            <ClipboardList className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Reason for Visit</h3>
            <p className="text-lg text-gray-800 leading-relaxed">{visit.reason}</p>
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-red-600" />
          Diagnoses
        </h3>
        {visit.diagnosis && visit.diagnosis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visit.diagnosis.map((diag, idx) => (
              <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-6 hover:bg-red-100 transition-colors">
                <h4 className="font-bold text-lg text-red-900 mb-1">{diag}</h4>
                <p className="text-sm text-red-700">Confirmed diagnosis</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">No diagnoses recorded</p>
          </div>
        )}
      </div>

      {/* Prescriptions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Pill className="w-7 h-7 text-green-600" />
          Prescriptions
        </h3>
        {visit.prescriptions && visit.prescriptions.length > 0 ? (
          <div className="space-y-4">
            {visit.prescriptions.map((prescription, idx) => (
              <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-green-900">{prescription.item}</h4>
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    Dosage: {prescription.dosage}
                  </span>
                </div>
                <p className="text-sm text-green-700">Frequency: {prescription.frequency}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">No prescriptions</p>
          </div>
        )}
      </div>

      {/* Lab Tests */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TestTube className="w-7 h-7 text-blue-600" />
          Lab Tests
        </h3>
        {visit.lab_tests && visit.lab_tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visit.lab_tests.map((test, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-1">{test.test}</h4>
                {test.result ? (
                  <p className="text-sm text-blue-700 font-mono bg-white px-3 py-1 rounded inline-block">
                    Result: {test.result}
                  </p>
                ) : (
                  <p className="text-sm text-blue-600 italic">Result pending</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">No lab tests</p>
          </div>
        )}
      </div>

      {/* Procedures */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-purple-600" />
          Procedures
        </h3>
        {visit.procedures && visit.procedures.length > 0 ? (
          <div className="space-y-3">
            {visit.procedures.map((procedure, idx) => (
              <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <h4 className="font-bold text-lg text-purple-900">{procedure}</h4>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">No procedures performed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitDetails;
