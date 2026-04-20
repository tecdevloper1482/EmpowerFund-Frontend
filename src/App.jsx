import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layouts/navbar'
import Footer from './components/layouts/Footer'
import Login from './pages/Login/Login'
import Register from './pages/Login/Register'
import Home from './pages/Home/Home'
import DiscoveryFeed from './pages/ProjectDetails/DiscoveryFeed'
import CreateProject from './pages/ProjectDetails/CreateProject'
import ProjectDetails from './pages/ProjectDetails/ProjectDetails'
import Profile from './pages/Profile/Profile'
import Dashboard from './pages/Dashboard/Dashboard'
import InvestorDashboard from './pages/InvestorDashboard/InvestorDashboard'
import Terms from './pages/Terms/Terms'
import './App.css'

const getFallbackDashboardByRole = (role) => {
  if (role === 'Investor') return '/investor/dashboard'
  return '/dashboard'
}

const PublicOnlyRoute = ({ children }) => {
  const storedAuth = localStorage.getItem('empowerfund_auth')

  if (!storedAuth) {
    return children
  }

  try {
    const auth = JSON.parse(storedAuth)
    if (auth?.token) {
      return <Navigate to='/' replace />
    }
  } catch {
    return children
  }

  return children
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const storedAuth = localStorage.getItem('empowerfund_auth')
  const currentLocation = useLocation()

  if (!storedAuth) {
    const returnTo = encodeURIComponent(currentLocation.pathname + currentLocation.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  try {
    const auth = JSON.parse(storedAuth)
    if (!auth?.token) {
      const returnTo = encodeURIComponent(currentLocation.pathname + currentLocation.search)
      return <Navigate to={`/login?returnTo=${returnTo}`} replace />
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(auth.role)) {
      return <Navigate to={getFallbackDashboardByRole(auth.role)} replace />
    }
  } catch {
    const returnTo = encodeURIComponent(currentLocation.pathname + currentLocation.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  return children
}

const App = () => {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/investor')

  return (
    <div className={`appShell ${isDashboard ? 'dashboardShell' : ''}`}>
      {!isDashboard && <Navbar />}

      <main className={isDashboard ? 'dashboardMain' : 'authMain'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/projects' element={<DiscoveryFeed />} />
          <Route path='/projects/create' element={<ProtectedRoute allowedRoles={['Creator']}><CreateProject /></ProtectedRoute>} />
          <Route path='/projects/:id' element={<ProjectDetails />} />
          <Route path='/login' element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path='/register' element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute allowedRoles={['Creator']}><Dashboard /></ProtectedRoute>} />
          <Route path='/investor/dashboard' element={<ProtectedRoute allowedRoles={['Investor']}><InvestorDashboard /></ProtectedRoute>} />
          <Route path='/investor/investments' element={<ProtectedRoute allowedRoles={['Investor']}><InvestorDashboard /></ProtectedRoute>} />
          <Route path='/investor/transactions' element={<ProtectedRoute allowedRoles={['Investor']}><InvestorDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  )
}

export default App
