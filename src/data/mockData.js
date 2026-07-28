// Centralized mock data for the clinic management frontend.
// No backend — everything here simulates what an API would return.

export const clinicProfile = {
  name: 'DermaCare Skin & Hair Clinic',
  tagline: 'Advanced Dermatology & Trichology Care',
  address: '14 Lotus Avenue, Bandra West, Mumbai, MH 400050',
  phone: '+91 98200 12345',
  email: 'hello@dermacareclinic.in',
  gstin: '27AACCD1234F1Z5',
  logoInitials: 'DC',
}

export const currentUser = {
  name: 'Dr. Anita Rao',
  role: 'Lead Dermatologist',
  email: 'anita.rao@dermacareclinic.in',
  avatarInitials: 'AR',
}

export const patients = [
  { id: 'PT-1001', name: 'Riya Sharma', age: 28, gender: 'Female', phone: '+91 90000 11122', concern: 'Acne & Scarring', lastVisit: '2026-07-20', status: 'Active', doctor: 'Dr. Anita Rao' },
  { id: 'PT-1002', name: 'Karan Mehta', age: 34, gender: 'Male', phone: '+91 90000 22233', concern: 'Hair Fall', lastVisit: '2026-07-18', status: 'Active', doctor: 'Dr. Vikram Sen' },
  { id: 'PT-1003', name: 'Ananya Iyer', age: 22, gender: 'Female', phone: '+91 90000 33344', concern: 'Pigmentation', lastVisit: '2026-07-15', status: 'Follow-up', doctor: 'Dr. Anita Rao' },
  { id: 'PT-1004', name: 'Rohit Verma', age: 45, gender: 'Male', phone: '+91 90000 44455', concern: 'Psoriasis', lastVisit: '2026-07-12', status: 'Active', doctor: 'Dr. Neha Kapoor' },
  { id: 'PT-1005', name: 'Simran Kaur', age: 30, gender: 'Female', phone: '+91 90000 55566', concern: 'Hair Transplant Consult', lastVisit: '2026-07-10', status: 'New', doctor: 'Dr. Vikram Sen' },
  { id: 'PT-1006', name: 'Aditya Nair', age: 26, gender: 'Male', phone: '+91 90000 66677', concern: 'Eczema', lastVisit: '2026-07-08', status: 'Active', doctor: 'Dr. Anita Rao' },
  { id: 'PT-1007', name: 'Meera Joshi', age: 39, gender: 'Female', phone: '+91 90000 77788', concern: 'Anti-Aging', lastVisit: '2026-07-05', status: 'Follow-up', doctor: 'Dr. Neha Kapoor' },
  { id: 'PT-1008', name: 'Farhan Ali', age: 31, gender: 'Male', phone: '+91 90000 88899', concern: 'Dandruff & Scalp Care', lastVisit: '2026-07-02', status: 'Active', doctor: 'Dr. Vikram Sen' },
  { id: 'PT-1009', name: 'Sneha Reddy', age: 24, gender: 'Female', phone: '+91 90000 99900', concern: 'Acne', lastVisit: '2026-06-29', status: 'New', doctor: 'Dr. Anita Rao' },
  { id: 'PT-1010', name: 'Vikas Gupta', age: 50, gender: 'Male', phone: '+91 90000 10101', concern: 'Hair Fall', lastVisit: '2026-06-25', status: 'Inactive', doctor: 'Dr. Neha Kapoor' },
  { id: 'PT-1011', name: 'Priya Desai', age: 27, gender: 'Female', phone: '+91 90000 20202', concern: 'Melasma', lastVisit: '2026-06-20', status: 'Active', doctor: 'Dr. Anita Rao' },
  { id: 'PT-1012', name: 'Arjun Rathore', age: 33, gender: 'Male', phone: '+91 90000 30303', concern: 'Beard Restoration', lastVisit: '2026-06-18', status: 'Follow-up', doctor: 'Dr. Vikram Sen' },
]

export const patientDetailExtra = {
  'PT-1001': {
    dob: '1998-03-14',
    email: 'riya.sharma@example.com',
    address: 'A-204, Silver Oak, Andheri East, Mumbai',
    bloodGroup: 'O+',
    allergies: 'None known',
    medicalNotes: 'Sensitive skin, prone to hyperpigmentation post-acne. Avoid retinoids above 0.1%.',
    treatments: [
      { date: '2026-07-20', name: 'Chemical Peel (Salicylic 30%)', doctor: 'Dr. Anita Rao', notes: 'Tolerated well, mild redness resolved in 24h.' },
      { date: '2026-06-10', name: 'Consultation + Skin Analysis', doctor: 'Dr. Anita Rao', notes: 'Started on topical retinoid + niacinamide serum.' },
    ],
    prescriptions: [
      { date: '2026-07-20', medicine: 'Tretinoin 0.025% Gel', dosage: 'Apply at night, pea-sized amount' },
      { date: '2026-07-20', medicine: 'Sunscreen SPF 50 PA+++', dosage: 'Apply every morning' },
    ],
    invoices: [
      { id: 'INV-3001', date: '2026-07-20', amount: 3540, status: 'Paid' },
      { id: 'INV-2987', date: '2026-06-10', amount: 1200, status: 'Paid' },
    ],
  },
}

export const dashboardStats = [
  { label: 'Total Patients', value: '1,248', change: '+8.2%', trend: 'up' },
  { label: 'Today\'s Appointments', value: '18', change: '+3', trend: 'up' },
  { label: 'Monthly Revenue', value: '₹4,82,600', change: '+12.4%', trend: 'up' },
  { label: 'Low Stock Items', value: '6', change: '-2', trend: 'down' },
]

export const revenueChart = [
  { month: 'Feb', value: 320000 },
  { month: 'Mar', value: 358000 },
  { month: 'Apr', value: 341000 },
  { month: 'May', value: 402000 },
  { month: 'Jun', value: 431000 },
  { month: 'Jul', value: 482600 },
]

export const recentPatients = patients.slice(0, 5)

export const lowStockMedicines = [
  { id: 'MED-104', name: 'Tretinoin 0.05% Cream', stock: 4, threshold: 15, expiry: '2026-11-30' },
  { id: 'MED-207', name: 'Minoxidil 5% Solution', stock: 6, threshold: 20, expiry: '2027-01-15' },
  { id: 'MED-312', name: 'Ketoconazole Shampoo', stock: 3, threshold: 10, expiry: '2026-09-10' },
]

export const quickActions = [
  { label: 'Register Patient', to: '/patients/register', icon: 'UserPlus' },
  { label: 'Create Invoice', to: '/billing', icon: 'Receipt' },
  { label: 'Add Medicine', to: '/inventory', icon: 'PackagePlus' },
  { label: 'View Reports', to: '/reports', icon: 'BarChart3' },
]

export const invoices = [
  { id: 'INV-3012', patient: 'Riya Sharma', date: '2026-07-25', amount: 3540, status: 'Paid', method: 'UPI' },
  { id: 'INV-3011', patient: 'Karan Mehta', date: '2026-07-24', amount: 5200, status: 'Pending', method: '—' },
  { id: 'INV-3010', patient: 'Ananya Iyer', date: '2026-07-23', amount: 1890, status: 'Paid', method: 'Card' },
  { id: 'INV-3009', patient: 'Rohit Verma', date: '2026-07-22', amount: 7650, status: 'Paid', method: 'Cash' },
  { id: 'INV-3008', patient: 'Simran Kaur', date: '2026-07-21', amount: 12500, status: 'Overdue', method: '—' },
  { id: 'INV-3007', patient: 'Aditya Nair', date: '2026-07-19', amount: 2400, status: 'Paid', method: 'UPI' },
  { id: 'INV-3006', patient: 'Meera Joshi', date: '2026-07-17', amount: 4300, status: 'Paid', method: 'Card' },
  { id: 'INV-3005', patient: 'Farhan Ali', date: '2026-07-15', amount: 1600, status: 'Pending', method: '—' },
]

export const treatmentOptions = [
  { id: 'TR-01', name: 'Consultation', price: 800 },
  { id: 'TR-02', name: 'Chemical Peel', price: 2500 },
  { id: 'TR-03', name: 'Laser Hair Reduction (Session)', price: 4500 },
  { id: 'TR-04', name: 'PRP Hair Therapy', price: 6000 },
  { id: 'TR-05', name: 'Microneedling', price: 3200 },
  { id: 'TR-06', name: 'HydraFacial', price: 2800 },
  { id: 'TR-07', name: 'Hair Transplant (per graft, x100)', price: 9500 },
]

export const medicineOptions = [
  { id: 'MED-101', name: 'Tretinoin 0.025% Gel', price: 340 },
  { id: 'MED-104', name: 'Tretinoin 0.05% Cream', price: 420 },
  { id: 'MED-207', name: 'Minoxidil 5% Solution', price: 650 },
  { id: 'MED-312', name: 'Ketoconazole Shampoo', price: 280 },
  { id: 'MED-405', name: 'Sunscreen SPF 50 PA+++', price: 590 },
  { id: 'MED-509', name: 'Niacinamide 10% Serum', price: 480 },
  { id: 'MED-611', name: 'Biotin Tablets (30ct)', price: 350 },
]

export const inventory = [
  { id: 'MED-101', name: 'Tretinoin 0.025% Gel', category: 'Topical', stock: 42, threshold: 15, expiry: '2027-03-10', supplier: 'Zenith Pharma Distributors' },
  { id: 'MED-104', name: 'Tretinoin 0.05% Cream', category: 'Topical', stock: 4, threshold: 15, expiry: '2026-11-30', supplier: 'Zenith Pharma Distributors' },
  { id: 'MED-207', name: 'Minoxidil 5% Solution', category: 'Hair Care', stock: 6, threshold: 20, expiry: '2027-01-15', supplier: 'Trichome Supplies Co.' },
  { id: 'MED-312', name: 'Ketoconazole Shampoo', category: 'Hair Care', stock: 3, threshold: 10, expiry: '2026-09-10', supplier: 'Trichome Supplies Co.' },
  { id: 'MED-405', name: 'Sunscreen SPF 50 PA+++', category: 'Skin Care', stock: 58, threshold: 20, expiry: '2027-06-01', supplier: 'Solaris Derma Labs' },
  { id: 'MED-509', name: 'Niacinamide 10% Serum', category: 'Skin Care', stock: 31, threshold: 15, expiry: '2027-02-20', supplier: 'Solaris Derma Labs' },
  { id: 'MED-611', name: 'Biotin Tablets (30ct)', category: 'Supplement', stock: 76, threshold: 25, expiry: '2027-08-14', supplier: 'VitaWell Nutraceuticals' },
  { id: 'MED-702', name: 'Hyaluronic Acid Serum', category: 'Skin Care', stock: 12, threshold: 15, expiry: '2026-10-05', supplier: 'Solaris Derma Labs' },
  { id: 'MED-803', name: 'Clindamycin Gel 1%', category: 'Topical', stock: 9, threshold: 12, expiry: '2026-08-22', supplier: 'Zenith Pharma Distributors' },
]

export const reportRevenueByMonth = revenueChart

export const reportPatientGrowth = [
  { month: 'Feb', new: 42, returning: 118 },
  { month: 'Mar', new: 51, returning: 129 },
  { month: 'Apr', new: 38, returning: 142 },
  { month: 'May', new: 60, returning: 151 },
  { month: 'Jun', new: 55, returning: 163 },
  { month: 'Jul', new: 67, returning: 171 },
]

export const reportMedicineSales = [
  { name: 'Tretinoin 0.025% Gel', units: 210, revenue: 71400 },
  { name: 'Sunscreen SPF 50 PA+++', units: 340, revenue: 200600 },
  { name: 'Minoxidil 5% Solution', units: 156, revenue: 101400 },
  { name: 'Niacinamide 10% Serum', units: 188, revenue: 90240 },
  { name: 'Biotin Tablets (30ct)', units: 122, revenue: 42700 },
]

export const clinicUsers = [
  { id: 1, name: 'Dr. Anita Rao', email: 'anita.rao@dermacareclinic.in', role: 'Admin / Doctor', status: 'Active' },
  { id: 2, name: 'Dr. Vikram Sen', email: 'vikram.sen@dermacareclinic.in', role: 'Doctor', status: 'Active' },
  { id: 3, name: 'Dr. Neha Kapoor', email: 'neha.kapoor@dermacareclinic.in', role: 'Doctor', status: 'Active' },
  { id: 4, name: 'Pooja Nair', email: 'pooja.nair@dermacareclinic.in', role: 'Front Desk', status: 'Active' },
  { id: 5, name: 'Suresh Kumar', email: 'suresh.kumar@dermacareclinic.in', role: 'Pharmacist', status: 'Inactive' },
]
