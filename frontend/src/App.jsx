import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { authAPI } from './services/api';

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
import UpcomingAppointments from './pages/UpcomingAppointments';
import FacilityWards from './pages/FacilityWards';
import FacilityAdmitted from './pages/FacilityAdmitted';
import PatientDetails from './pages/PatientDetails';
import PatientHistory from './pages/PatientHistory';
import PatientVaccinationHistory from './pages/PatientVaccinationHistory';
import PatientEligibleVaccines from './pages/PatientEligibleVaccines';
import FacilityInventory from './pages/FacilityInventory';
import FacilityAppointment from './pages/FacilityAppointment';
import NewVisit from './pages/NewVisit';
import AddDiagnosis from './pages/AddDiagnosis';
import AddPrescription from './pages/AddPrescription';
import AddLabOrders from './pages/AddLabOrders';
import AdmitPatient from './pages/AdmitPatient';
import DischargePatient from './pages/DischargePatient';
import AddProcedure from './pages/AddProcedure';
import CurrentPatients from './pages/CurrentPatients';
import TransferPatient from './pages/TransferPatient';
import AddVaccination from './pages/AddVaccination';
import LogUsage from './pages/LogUsage';
import FacilityWorkers from './pages/FacilityWorkers';
import PendingLabOrders from './pages/PendingLabOrders';
import LabResultUpload from './pages/LabResultUpload';

function PatientWrapper() {
  const { citizenId } = useParams();
  return <MedicalHistory citizenId={citizenId} />;
}

// Guards a single route by role. Renders children if allowed,
// otherwise bounces to a safe default for that user.
function RequireRole({ roles, user, children }) {
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => authAPI.getCurrentUser());

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const handleLogin = (loginResponse) => {
    // loginResponse: { role, token, citizen_id? | worker_id? | id? }
    // authAPI.login already writes to localStorage; this just updates in-memory state
    setCurrentUser(authAPI.getCurrentUser());
  };

  return (
    <Router>
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <nav className="bg-blue-800 text-white px-6 py-4 shadow-lg flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black tracking-wide">National Health System</h1>

              <div className="hidden md:flex space-x-6 text-sm font-semibold text-blue-200">
                <Link to="/directory" className="hover:text-blue-200 transition-colors">Service Directory</Link>

                {currentUser.role === 'citizen' && (
                  <Link to="/citizen/dashboard" className="hover:text-white transition-colors">My Dashboard</Link>
                )}
                {currentUser.role === 'worker' && (
                  <Link to="/facility-dashboard" className="hover:text-white transition-colors">Facility Command</Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="hover:text-white transition-colors">Dept of Health Admin</Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/facility-workers" className="hover:text-white transition-colors">Facility Workers</Link>
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

          <main className="flex-grow">
            <Routes>
              {/* Public to any authenticated role */}
              <Route path="/directory" element={<ServiceDirectory />} />
              <Route path="/visit/:visitId" element={<VisitDetails />} />

              {/* Citizen-only */}
              <Route path="/citizen/dashboard" element={
                <RequireRole roles={['citizen']} user={currentUser}><CitizenDashboard /></RequireRole>
              } />
              <Route path="/book/appointment" element={
                <RequireRole roles={['citizen', 'worker', 'admin']} user={currentUser}><BookAppointment /></RequireRole>
              } />
              <Route path="/vaccination/history" element={
                <RequireRole roles={['citizen']} user={currentUser}><VaccinationHistory citizenId={currentUser.id} /></RequireRole>
              } />
              <Route path="/eligible/vaccines" element={
                <RequireRole roles={['citizen']} user={currentUser}><EligibleVaccines citizenId={currentUser.id} /></RequireRole>
              } />
              <Route path="/medical/history" element={
                <RequireRole roles={['citizen']} user={currentUser}><MedicalHistory citizenId={currentUser.id} /></RequireRole>
              } />
              <Route path="/upcoming" element={
                <RequireRole roles={['citizen']} user={currentUser}><UpcomingAppointments citizenId={currentUser.id} /></RequireRole>
              } />

              {/* Worker/admin-only: facility operations */}
              <Route path="/facility-dashboard" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><FacilityDashboard /></RequireRole>
              } />
              <Route path="/wards" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><FacilityWards /></RequireRole>
              } />
              <Route path="/facility-admitted" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><FacilityAdmitted /></RequireRole>
              } />
              <Route path="/patient-details/:patientId" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><PatientDetails /></RequireRole>
              } />
              <Route path="/patient/history/:citizenId" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><PatientHistory /></RequireRole>
              } />
              <Route path="/patient/vaccination/:citizenId" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><PatientVaccinationHistory /></RequireRole>
              } />
              <Route path="/patient/vaccination/eligible/:citizenId" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><PatientEligibleVaccines /></RequireRole>
              } />
              <Route path="/inventory" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><FacilityInventory /></RequireRole>
              } />
              <Route path="/facility-appointments" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><FacilityAppointment /></RequireRole>
              } />
              <Route path="/new-visit" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><NewVisit /></RequireRole>
              } />
              <Route path="/diagnosis/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AddDiagnosis /></RequireRole>
              } />
              <Route path="/prescription/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AddPrescription /></RequireRole>
              } />
              <Route path="/lab-orders/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AddLabOrders /></RequireRole>
              } />
              <Route path="/admit/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AdmitPatient /></RequireRole>
              } />
              <Route path="/discharge/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><DischargePatient /></RequireRole>
              } />
              <Route path="/procedure/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AddProcedure /></RequireRole>
              } />
              <Route path="/transfer/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><TransferPatient /></RequireRole>
              } />
              <Route path="/vaccination/:visitId" element={
                <RequireRole roles={['worker']} user={currentUser}><AddVaccination /></RequireRole>
              } />
              <Route path="/current-patients" element={
                <RequireRole roles={['worker', 'admin']} user={currentUser}><CurrentPatients /></RequireRole>
              } />
              <Route path="/log-usage" element={
                <RequireRole roles={['worker']} user={currentUser}><LogUsage /></RequireRole>
              } />
              <Route path="/pending-lab-orders" element={
                <RequireRole roles={['worker']} user={currentUser}><PendingLabOrders /></RequireRole>
              } />
              <Route path="/lab-result-upload/:orderId" element={
                <RequireRole roles={['worker']} user={currentUser}><LabResultUpload /></RequireRole>
              } />

              {/* Admin-only */}
              <Route path="/admin" element={
                <RequireRole roles={['admin']} user={currentUser}><AdminDashboard /></RequireRole>
              } />
              <Route path="/facility-workers" element={
                <RequireRole roles={['admin']} user={currentUser}><FacilityWorkers /></RequireRole>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;