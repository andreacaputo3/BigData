import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Aqi from './pages/AirQuality.jsx';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/DashboardAdmin';
import Wallet from './pages/Wallet';


const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aqi" element={<Aqi />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
        </Routes>
    );
};

export default App;
