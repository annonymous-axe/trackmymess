import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import '@/App.css';

// Import pages
import Login from '@/pages/Login';
import SuperAdminDashboard from '@/pages/SuperAdmin/Dashboard';
import ClientManagement from '@/pages/SuperAdmin/ClientManagement';
import AdminDashboard from '@/pages/Admin/Dashboard';
import CustomerManagement from '@/pages/Admin/CustomerManagement';
import MealPlanManagement from '@/pages/Admin/MealPlanManagement';
import AttendanceManagement from '@/pages/Admin/AttendanceManagement';
import PauseManagement from '@/pages/Admin/PauseManagement';
import PaymentManagement from '@/pages/Admin/PaymentManagement';
import InvoiceManagement from '@/pages/Admin/InvoiceManagement';
import StaffManagement from '@/pages/Admin/StaffManagement';
import Reports from '@/pages/Admin/Reports';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API}/auth/refresh`, { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      setUser(user);
      toast.success('Login successful!');
      
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/clients"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <ClientManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute role="ADMIN">
            <CustomerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/meal-plans"
        element={
          <ProtectedRoute role="ADMIN">
            <MealPlanManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute role="ADMIN">
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pause-requests"
        element={
          <ProtectedRoute role="ADMIN">
            <PauseManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="ADMIN">
            <PaymentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute role="ADMIN">
            <InvoiceManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          user ? (
            user.role === 'SUPER_ADMIN' ? (
              <Navigate to="/super-admin" />
            ) : (
              <Navigate to="/admin" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
export { API };
