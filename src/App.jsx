import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import RegisterPatient from './pages/RegisterPatient.jsx'
import PatientDetails from './pages/PatientDetails.jsx'
import Billing from './pages/Billing.jsx'
import Payments from './pages/Payments.jsx'
import Inventory from './pages/Inventory.jsx'
import Pharmacy from './pages/Pharmacy.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/register" element={<RegisterPatient />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
