import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { citizenAPI } from '../services/api';
import { 
  Activity, 
  Syringe, 
  CalendarDays, 
  Stethoscope, 
  MapPin,
  FileText,
  Users 
} from 'lucide-react';

const CitizenDashboard = () => {
  const citizenId = localStorage.getItem("citizen_id");
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalVaccines: 0,
    eligibleVaccines: 0,
    activePrescriptions: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (citizenId) {
      loadStats();
    }
  }, [citizenId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with real endpoints
      const [
        history,
        vaccines,
        eligible,
        prescriptions,
        appointments
      ] = await Promise.all([
        citizenAPI.medicalHistory(citizenId).catch(() => []),
        citizenAPI.vaccinationHistory(citizenId).catch(() => []),
        citizenAPI.eligibleVaccines(citizenId).catch(() => []),
        fetchPendingPrescriptions(citizenId).catch(() => []),
        fetchPendingAppointments(citizenId).catch(() => [])
      ]);

      setStats({
        totalVisits: history.length,
        totalVaccines: vaccines.length,
        eligibleVaccines: eligible.length,
        activePrescriptions: prescriptions.length,
        pendingAppointments: appointments.length
      });
    } catch (err) {
      console.error('Stats load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Medical History",
      count: stats.totalVisits,
      icon: Activity,
      color: "from-blue-500 to-blue-600",
      to: "/medical/history",
      desc: "View all your past visits and diagnoses"
    },
    {
      title: "Vaccination Record",
      count: stats.totalVaccines,
      icon: Syringe,
      color: "from-green-500 to-green-600",
      to: "/vaccination/history",
      desc: "Complete vaccination history"
    },
    {
      title: "Eligible Vaccines",
      count: stats.eligibleVaccines,
      icon: Syringe,
      color: "from-emerald-500 to-teal-600",
      to: "/eligible/vaccines",
      desc: "Vaccines recommended for you now"
    },
    {
      title: "Active Prescriptions",
      count: stats.activePrescriptions,
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      to: "/prescriptions",
      desc: "Current medications & refills"
    },
    {
      title: "Pending Appointments",
      count: stats.pendingAppointments,
      icon: CalendarDays,
      to: "/appointments",
      color: "from-orange-500 to-orange-600",
      desc: "Upcoming visits & bookings"
    },
    {
      title: "Service Directory",
      icon: MapPin,
      color: "from-indigo-500 to-purple-600",
      to: "/directory",
      desc: "Find nearby labs, pharmacies, clinics"
    },
    {
      title: "Book Appointment",
      icon: Stethoscope,
      color: "from-rose-500 to-pink-600",
      to: "/book/appointment",
      desc: "Schedule your next visit"
    }
  ];

  // Mock functions - replace with API calls
  const fetchPendingPrescriptions = async () => [];
  const fetchPendingAppointments = async () => [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm shadow-2xl mb-8 border border-white/50">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Citizen Portal</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
            Your Health at a Glance
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access your complete medical journey, schedule appointments, and stay up to date with vaccinations
          </p>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3 gap-6 mb-20">
          {cards.slice(0, 4).map((card, index) => {
            const Icon = card.icon;
            return (
              <Link 
                key={card.title}
                to={card.to}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl border border-white/50 hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
              >
                <div className="p-4 bg-gradient-to-br rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300" style={{background: `linear-gradient(135deg, ${card.color.replace('to-', ', ')})`}}>
                  <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {card.count !== undefined ? (
                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {card.count}
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                      Explore
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.slice(4).map((card, index) => {
            const Icon = card.icon;
            return (
              <Link 
                key={card.title}
                to={card.to}
                className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-white/30 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 h-32"
              >
                <div className="p-4 bg-gradient-to-br rounded-2xl flex-shrink-0" style={{background: `linear-gradient(135deg, ${card.color.replace('to-', ', ')})`}}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-700">{card.title}</h4>
                  <p className="text-gray-600 text-sm">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
