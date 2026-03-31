import { useState } from "react";
import MedicalHistory from "./MedicalHistory";
import VaccinationHistory from "./VaccinationHistory";
import BookAppointment from "./BookAppointment";


const CitizenDashboard = () => {
    const [tab, setTab] = useState("history");
    const citizenId = localStorage.getItem("citizen_id");

    const tabs = [
        { key: "history", label: "Medical History" },
        { key: "vaccination", label: "Vaccinations" },
        { key: "book", label: "Book Appointment" },
        { key: "eligible", label: "Eligible Vaccines" },
        {key : "search", label: "Search Facilities"},
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b pb-2">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            tab === t.key
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {tab === "history" && <MedicalHistory citizenId={citizenId} />}
                {tab === "vaccination" && <VaccinationHistory citizenId={citizenId} />}
                {tab === "book" && <BookAppointment />}
                
            </div>

        </div>
    );
};

export default CitizenDashboard;