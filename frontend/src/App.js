import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardMother from './pages/DashboardMother';
import DashboardPsychologist from './pages/DashboardPsychologist';
import DashboardDirector from './pages/DashboardDirector';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/mother" element={<DashboardMother />} />
            <Route path="/dashboard/tante" element={<DashboardMother />} />
            <Route path="/dashboard/educator" element={<DashboardMother />} />
            <Route path="/dashboard/psychologist" element={<DashboardPsychologist />} />
            <Route path="/dashboard/director" element={<DashboardDirector />} />
            {/* Default to Signup as requested */}
            <Route path="/" element={<Navigate to="/signup" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;