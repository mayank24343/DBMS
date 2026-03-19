import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookCitizenAppointment } from '../services/api';
import { CalendarClock, ArrowLeft, MapPin, Stethoscope } from 'lucide-react';

const BookAppointment = () => {
    const { aadharNo } = useParams();
    const navigate = useNavigate();

    const [facilities, setFacilities] = useState([]);
    const [formData, setFormData] = useState({
        aadhar_no: aadharNo,
        facility_id: '',
        appointment_date: '',
        reason: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔥 Fetch facilities from backend
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/facilities/")
            .then(res => res.json())
            .then(data => {
                setFacilities(data);

                // Set default facility
                if (data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        facility_id: data[0].id
                    }));
                }
            })
            .catch(err => {
                console.error("Failed to fetch facilities:", err);
                setError("Failed to load facilities");
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // 🔥 Map to backend schema
            await bookCitizenAppointment({
                citizen_id: formData.aadhar_no,
                centre_id: formData.facility_id,
                visit_date: formData.appointment_date,
                reason: formData.reason
            });

            alert("Appointment scheduled successfully!");
            navigate(`/citizen/${aadharNo}`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to book appointment");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-8">
            <Link
                to={`/citizen/${aadharNo}`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to My Records
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3">
                        <CalendarClock className="w-8 h-8 text-blue-200" />
                        Book an Appointment
                    </h1>
                    <p className="text-blue-100 mt-2 font-medium">
                        Schedule a visit at your nearest health centre.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-bold text-sm">
                            {error}
                        </div>
                    )}

                    {/* Facility Dropdown */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400" /> Select Health Facility
                        </label>

                        <select
                            name="facility_id"
                            value={formData.facility_id}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {facilities.length === 0 ? (
                                <option>Loading...</option>
                            ) : (
                                facilities.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <CalendarClock className="w-4 h-4 text-gray-400" /> Preferred Date
                        </label>

                        <input
                            type="date"
                            name="appointment_date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.appointment_date}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" /> Reason for Visit
                        </label>

                        <textarea
                            name="reason"
                            required
                            rows="3"
                            placeholder="Describe your symptoms..."
                            value={formData.reason}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            !formData.facility_id ||
                            !formData.appointment_date ||
                            !formData.reason
                        }
                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all ${
                            isSubmitting
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                        }`}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;