import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Activity, Syringe, HeartPulse, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = React.useState(null);


  const quickActions = [
    {
      title: "Medical History",
      icon: Activity,
      to: `/patient/history/${patientId}/`,
      desc: "Complete visit & diagnosis history"
    },
    {
      title: "Vaccination Record",
      icon: Syringe,
      to: `/patient/vaccination/${patientId}/`,
      desc: "All vaccination records"
    },
    {
      title: "Eligible Vaccines",
      icon: Syringe,
      to: `/patient/vaccination/eligible/${patientId}/`,
      desc: "Vaccinations eligible for but not taken"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg mb-6">
            <User className="w-5 h-5 mr-2" />
            Patient Overview
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
            Patient Details
          </h1>
          <p className="text-xl text-gray-600">Patient ID: <span className="font-bold text-2xl text-gray-900">#{patientId}</span></p>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12 border border-gray-100 max-w-2xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient #{patientId}</h2>
              
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                to={action.to}
                key={index}
                className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-all">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{action.desc}</p>
                </div>
            </Link>
              
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
