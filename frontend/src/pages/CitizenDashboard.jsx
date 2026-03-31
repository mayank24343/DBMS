import { useState } from "react";
import MedicalHistory from "./MedicalHistory";
import VaccinationHistory from "./VaccinationHistory";
import BookAppointment from "./BookAppointment";
import EligibleVaccines from "./EligibleVaccines";
import ServiceDirectory from "./ServiceDirectory";

const CitizenDashboard = () => {
    const [tab, setTab] = useState("history");
    const citizenId = localStorage.getItem("citizen_id");

    const tabs = [
        { key: "history", label: "Medical History" },
        { key: "vaccination", label: "Vaccination History" },
        { key: "eligible", label: "Eligible Vaccines" },
        { key: "directory", label: "Service Directory" },
        { key: "book", label: "Book Appointment" },
    ];

    const renderTabContent = () => {
        switch (tab) {
            case "history":
                return <MedicalHistory citizenId={citizenId} />;
            case "vaccination":
                return <VaccinationHistory citizenId={citizenId} />;
            case "eligible":
                return <EligibleVaccines citizenId={citizenId} />;
            case "directory":
                return <ServiceDirectory />;
            case "book":
                return <BookAppointment />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Citizen Health Portal
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Manage your medical records, book appointments, and discover eligible vaccinations
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                        <div className="text-gray-600 font-medium">Total Visits</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                        <div className="text-gray-600 font-medium">Vaccines Complete</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
                        <div className="text-gray-600 font-medium">Pending Appointments</div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                        <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                        <div className="text-gray-600 font-medium">Active Prescriptions</div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
                    <div className="grid grid-cols-5 gap-0.5 p-1 bg-gradient-to-r from-gray-100 to-gray-200">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`py-4 px-6 font-bold text-sm uppercase tracking-wide transition-all relative group ${
                                    tab === t.key
                                        ? 'bg-white shadow-lg text-blue-700 border-2 border-blue-200'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }`}
                            >
                                {t.label}
                                {tab === t.key && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 min-h-[500px]">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
