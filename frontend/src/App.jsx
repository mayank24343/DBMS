import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import Login from './pages/Login';
import MedicalHistory from './pages/MedicalHistory';
import VisitDetails from './pages/VisitDetails';
import FacilityDashboard from './pages/FacilityDashboard';

import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import ServiceDirectory from './pages/ServiceDirectory';
import VaccinationHistory from './pages/VaccinationHistory';
import CitizenDashboard from './pages/CitizenDashboard';
import EligibleVaccines from './pages/EligibleVaccines';

function CitizenWrapper() {
  const { aadharNo } = useParams();
  return <MedicalHistory aadharNo={aadharNo} />;
}

function App() {
  // Global State: Keeps track of who is currently logged in
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      {/* If not logged in, ONLY show the Login page */}
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Login onLogin={setCurrentUser} />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          
          {/* Dynamic Navigation Bar based on Role */}
          <nav className="bg-blue-800 text-white px-6 py-4 shadow-lg flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black tracking-wide">National Health System</h1>
              
              <div className="hidden md:flex space-x-6 text-sm font-semibold text-blue-200">
                <Link to="/directory" className="hover:text-blue-200 transition-colors">Service Directory</Link>
                {currentUser.role === 'citizen' && (
                  <Link to={`/citizen/dashboard`} className="hover:text-white transition-colors">My Records</Link>
                )}
                {currentUser.role === 'worker' && (
                  <Link to={`/facility/${currentUser.id}`} className="hover:text-white transition-colors">Facility Command</Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="hover:text-white transition-colors">Dept of Health Admin</Link>
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </nav>

          {/* Protected Routes */}
          <main className="flex-grow">
            <Routes>
              
              <Route path="/visit/:visitId" element={<VisitDetails />} />
              <Route path="/facility/:facId" element={<FacilityDashboard />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/directory" element={<ServiceDirectory />} />
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/visit/:visitId" element={<VisitDetails />} />
              <Route path="/facility-dashboard" element={<FacilityDashboard />} />
              <Route path="/book/appointment" element={<BookAppointment />} />
              <Route path="/vaccination/history" element={<VaccinationHistory citizenId={currentUser.id}/>} />
              <Route path="/eligible/vaccines" element={<EligibleVaccines citizenId={currentUser.id}/>} />
              <Route path='/medical/history' element={<MedicalHistory citizenId={currentUser.id} />} />
              
              {/* Fallback route if they type a bad URL */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

        </div>
      )}
    </Router>
  );
}

export default App;