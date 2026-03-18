import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookCitizenAppointment } from '../services/api';
import { CalendarClock, ArrowLeft, MapPin, Stethoscope } from 'lucide-react';

const BookAppointment = () => {
    const { aadharNo } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        aadhar_no: aadharNo,
        facility_id: '1', // Defaulting to the first option
        appointment_date: '',
        reason: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            await bookCitizenAppointment(formData);
            alert("Appointment scheduled successfully!");
            navigate(`/citizen/${aadharNo}`); // Send them back to their dashboard
        } catch (err) {
            setError(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-8">
            <Link to={`/citizen/${aadharNo}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to My Records
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3">
                        <CalendarClock className="w-8 h-8 text-blue-200" />
                        Book an Appointment
                    </h1>
                    <p className="text-blue-100 mt-2 font-medium">Schedule a visit at your nearest health centre.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-bold text-sm">
                            {error}
                        </div>
                    )}

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
                            <option value="1">Central General Hospital (ID: 1)</option>
                            <option value="2">City Care Clinic (ID: 2)</option>
                            <option value="142">National Research Lab (ID: 142)</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <CalendarClock className="w-4 h-4 text-gray-400" /> Preferred Date
                        </label>
                        <input 
                            type="date" 
                            name="appointment_date" 
                            required 
                            min={new Date().toISOString().split('T')[0]} // Prevents booking in the past
                            value={formData.appointment_date} 
                            onChange={handleChange} 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" /> Reason for Visit
                        </label>
                        <textarea 
                            name="reason" 
                            required 
                            rows="3" 
                            placeholder="Please briefly describe your symptoms or reason for visit..."
                            value={formData.reason} 
                            onChange={handleChange} 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;