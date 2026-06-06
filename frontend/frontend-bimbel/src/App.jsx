import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import SiswaDashboard from './pages/siswa/SiswaDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* root URL otomatis ke halaman login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Daftar rute halaman */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/siswa" element={<SiswaDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;