import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import RegisterPatient from './pages/RegisterPatient.jsx'
import PatientDetails from './pages/PatientDetails.jsx'
import Billing from './pages/Billing.jsx'
import Payments from './pages/Payments.jsx'
import PaymentPatientDetails from './pages/PaymentPatientDetails.jsx'
import Inventory from './pages/Inventory.jsx'
import InventoryMedicines from './pages/InventoryMedicines.jsx'
import InventoryTreatments from './pages/InventoryTreatments.jsx'
import Pharmacy from './pages/Pharmacy.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import AuditorDashboard from './pages/AuditorDashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import { getToken, getRole } from './api/client.js'
import { ClinicProfileProvider } from './context/ClinicProfileContext.jsx'

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

// The Auditor gets its own read-only dashboard/report section, separate from the
// operational pages (Billing, Patients, Inventory, Settings, …) that are built for data
// entry — those must stay off-limits to Auditor even though the backend already rejects
// any write the UI might otherwise allow. These two guards partition the routes below
// Layout into "everything except Auditor" and "Auditor only," redirecting either way
// rather than repeating a role check on every individual route.
function RequireNotAuditor() {
  return getRole() === 'AUDITOR' ? <Navigate to="/auditor/dashboard" replace /> : <Outlet />
}

function RequireAuditor() {
  return getRole() === 'AUDITOR' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ClinicProfileProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route element={<RequireNotAuditor />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/register" element={<RegisterPatient />} />
            <Route path="/patients/:id/edit" element={<RegisterPatient />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/patient/:patientId" element={<PaymentPatientDetails />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/medicines" element={<InventoryMedicines />} />
            <Route path="/inventory/treatments" element={<InventoryTreatments />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<RequireAuditor />}>
            <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClinicProfileProvider>
  )
}
