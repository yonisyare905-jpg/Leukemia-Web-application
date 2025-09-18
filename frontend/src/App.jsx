
import { Route, Routes, useLocation } from 'react-router'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast';
import AppointmentPage from './pages/AppointmentPage'
import AboutUsPage from './pages/AboutUsPage'
import UnAuthenticatedRoute from './components/UnAuthenticatedRoute'
import DashboardPage from './pages/DashboardPage'
import DashboardLayout from './components/DashboardLayout'
import DashboardViewPage from './pages/DashboardViewPage'
import LabPage from './pages/LabPage'
import ReportsPage from './pages/ReportsPage'
import UserManagementPage from './pages/UserManagementPage'
import CreateUserPage from './pages/CreateUserPage'
import Homepage from './pages/HomePage'
import AppointmentDisplay from './pages/AppointmentDisplay'
import PatientRecordFormPage from './pages/PatientRecordFormPage'
import PatientRecordDisplayPage from './pages/PatientRecordDisplayPage'
import PatientRecordReview from './pages/PatientRecordReview'
import DoctorInfoPage from './pages/DoctorInfoPage'
import DoctorManagement from './pages/DoctorManagement'
import DoctorForm from './components/DoctorForm'
const App = () => {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/dashboard-view');
  return (
    <AuthProvider>
      <div>
      {/* header */}
      <Header/>
      <main>
        {/* routes */}
        <Routes>

          {/* public routes */}
          <Route path='/' element={<Homepage/>}/>
          <Route path='/appointment' element={<AppointmentPage/>}/>
          <Route path='/about-us' element={<AboutUsPage/>}/>
          <Route path='/doctor/:id' element={<DoctorInfoPage/>}/>

          {/* nested routes */}
          <Route path="/dashboard-view" element={<DashboardLayout/>}>
            <Route index element={<DashboardViewPage/>} />
            <Route path="lab" element={<LabPage/>} />
            <Route path="doctor-management" element={<DoctorManagement/>} />
            <Route path="create-doctor" element={<DoctorForm/>} />
            <Route path="create-doctor/:id" element={<DoctorForm/>} />
            <Route path="create-doctor" element={<DoctorForm/>} />
            <Route path="user-management" element={<UserManagementPage/>} />
            <Route path="profile" element={<ProfilePage/>} />
            <Route path="reports" element={<ReportsPage/>} />
            <Route path="patient-record" element={<PatientRecordFormPage/>} />
            <Route path="edit-patient/:id" element={<PatientRecordFormPage/>} />
            <Route path="create-user" element={<CreateUserPage/>} />
            <Route path="update-user/:id" element={<CreateUserPage/>} />
            <Route path="appointment-display" element={<AppointmentDisplay/>} />
            <Route path="patient-record-display" element={<PatientRecordDisplayPage/>} />
            <Route path="patient-review/:id" element={<PatientRecordReview/>} />
          </Route>

          {/* protected route */}
          <Route path='/signin' 
            element={
              <UnAuthenticatedRoute>
                <SignInPage/>
              </UnAuthenticatedRoute>
            }/>
          <Route path='/signup' 
            element={
              <UnAuthenticatedRoute>
                <SignUpPage/>
              </UnAuthenticatedRoute>
            }/>

            {/* authenticated route */}
            <Route path='/profile' 
              element={
                <ProtectedRoute>
                  <ProfilePage/>
                </ProtectedRoute>
              }/>
            <Route path='/dashboard' 
              element={
                <ProtectedRoute>
                  <DashboardPage/>
                </ProtectedRoute>
              }/>
        </Routes>
      </main>
        {/* Only show footer outside dashboard pages */}
        {!isDashboardRoute && <Footer/>}
      </div>
      <Toaster />
    </AuthProvider>
  )
}

export default App